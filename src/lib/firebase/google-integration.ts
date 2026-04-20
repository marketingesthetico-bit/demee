import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { GoogleOAuthError, refreshAccessToken } from "@/lib/google/oauth";

import { getAdminDb } from "./admin";

/**
 * Persisted shape at /users/{uid}/integrations/google-calendar.
 * accessToken is short-lived (~1h); refreshToken is long-lived and is
 * what we rely on to keep the integration alive.
 */
export interface GoogleIntegration {
  accountEmail: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO
  scope: string;
  calendarId: string;
  connectedAt: string; // ISO
}

const DOC_PATH = (uid: string) =>
  getAdminDb().collection("users").doc(uid).collection("integrations").doc("google-calendar");

/**
 * Converts either a Firestore Timestamp, an ISO string, or a Date into
 * an ISO string — otherwise falls back to `now`. Critical: we pass this
 * value down to Client Components, and Next.js can't serialize a
 * Firestore Timestamp object across the server/client boundary, which
 * is exactly what crashed /edit after the OAuth callback.
 */
function isoFromMixed(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    const obj = raw as { toDate?: () => Date };
    if (typeof obj.toDate === "function") {
      try {
        return obj.toDate().toISOString();
      } catch {
        /* fall through */
      }
    }
  }
  return new Date().toISOString();
}

export async function loadGoogleIntegration(
  uid: string,
): Promise<GoogleIntegration | null> {
  const snap = await DOC_PATH(uid).get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data) return null;
  const refreshToken = data.refreshToken as string | undefined;
  const accessToken = data.accessToken as string | undefined;
  const expiresAt = data.expiresAt as string | undefined;
  if (!refreshToken || !accessToken || !expiresAt) return null;
  return {
    accountEmail: (data.accountEmail as string) ?? "",
    accessToken,
    refreshToken,
    expiresAt,
    scope: (data.scope as string) ?? "",
    calendarId: (data.calendarId as string) ?? "primary",
    connectedAt: isoFromMixed(data.connectedAt),
  };
}

interface SaveInput {
  accountEmail: string;
  accessToken: string;
  /** Leave undefined to keep the existing refresh token on a re-connect. */
  refreshToken?: string;
  expiresInSeconds: number;
  scope: string;
}

export async function saveGoogleIntegration(uid: string, input: SaveInput): Promise<void> {
  const expiresAt = new Date(Date.now() + input.expiresInSeconds * 1000).toISOString();
  const base: Record<string, unknown> = {
    accountEmail: input.accountEmail,
    accessToken: input.accessToken,
    expiresAt,
    scope: input.scope,
    calendarId: "primary",
    connectedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (input.refreshToken) base.refreshToken = input.refreshToken;
  await DOC_PATH(uid).set(base, { merge: true });
}

export async function deleteGoogleIntegration(uid: string): Promise<void> {
  await DOC_PATH(uid).delete();
}

/**
 * Returns a valid access token, refreshing on demand and persisting the
 * new token. Used right before calling the Calendar API.
 *
 * Throws GoogleOAuthError("no-refresh-token") when the integration is
 * missing or corrupted — callers should treat as "no integration".
 */
export async function getFreshAccessToken(uid: string): Promise<{
  accessToken: string;
  calendarId: string;
  accountEmail: string;
} | null> {
  const integration = await loadGoogleIntegration(uid);
  if (!integration) return null;

  const now = Date.now();
  const expiresAtMs = Date.parse(integration.expiresAt);
  // 60s safety margin to avoid sending the request with a token that's
  // about to flip over mid-flight.
  if (Number.isFinite(expiresAtMs) && expiresAtMs - now > 60_000) {
    return {
      accessToken: integration.accessToken,
      calendarId: integration.calendarId,
      accountEmail: integration.accountEmail,
    };
  }

  try {
    const refreshed = await refreshAccessToken(integration.refreshToken);
    await DOC_PATH(uid).update({
      accessToken: refreshed.access_token,
      expiresAt: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      scope: refreshed.scope,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {
      accessToken: refreshed.access_token,
      calendarId: integration.calendarId,
      accountEmail: integration.accountEmail,
    };
  } catch (err) {
    // Refresh token dead or revoked → mark integration as broken so the
    // UI can prompt a re-connect next time the user opens /edit.
    console.error("[google-integration] refresh failed", err);
    if (err instanceof GoogleOAuthError && err.code === "refresh-failed") {
      await DOC_PATH(uid).update({
        accessToken: "",
        expiresAt: new Date(0).toISOString(),
        lastError: "refresh-failed",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    return null;
  }
}
