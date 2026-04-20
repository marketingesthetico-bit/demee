import "server-only";

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
] as const;

export class GoogleOAuthError extends Error {
  constructor(
    public code: "not-configured" | "exchange-failed" | "refresh-failed" | "no-refresh-token",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "GoogleOAuthError";
  }
}

function requireEnv(): { clientId: string; clientSecret: string; redirectUri: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new GoogleOAuthError(
      "not-configured",
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI must all be set.",
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI,
  );
}

export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = requireEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    // Forces a refresh_token on repeat connections (Google otherwise may
    // omit it the second time the same account grants consent).
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: "Bearer";
  id_token?: string;
}

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri } = requireEnv();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GoogleOAuthError("exchange-failed", `${res.status} ${body}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<Pick<TokenResponse, "access_token" | "expires_in" | "scope" | "token_type">> {
  const { clientId, clientSecret } = requireEnv();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GoogleOAuthError("refresh-failed", `${res.status} ${body}`);
  }
  return (await res.json()) as Pick<
    TokenResponse,
    "access_token" | "expires_in" | "scope" | "token_type"
  >;
}

/**
 * Best-effort revoke. Google will 200 even if the token is already
 * invalid. Callers should treat any non-2xx as a soft failure.
 */
export async function revokeToken(token: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }).catch(() => {
    // Swallow — we still delete the local row even if revoke fails.
  });
}

/**
 * Decodes the id_token payload without signature verification. Safe for
 * reading the account email we just got back through a trusted TLS
 * connection to Google's token endpoint.
 */
export function decodeIdTokenEmail(idToken: string): string | null {
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1]!;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(json) as { email?: string };
    return typeof parsed.email === "string" ? parsed.email : null;
  } catch {
    return null;
  }
}
