import "server-only";

import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";

import { getAdminAuth } from "./admin";
import { SESSION_COOKIE_NAME, SESSION_EXPIRY_MS } from "./session-constants";

export { SESSION_COOKIE_NAME, SESSION_EXPIRY_MS };

export async function createSessionCookie(idToken: string): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, { expiresIn: SESSION_EXPIRY_MS });
}

export async function verifySessionCookie(cookie: string): Promise<DecodedIdToken> {
  return getAdminAuth().verifySessionCookie(cookie, true);
}

export async function getServerSession(): Promise<DecodedIdToken | null> {
  const cookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    return await verifySessionCookie(cookie);
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_EXPIRY_MS / 1000,
  };
}
