import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/firebase/session";
import { saveGoogleIntegration } from "@/lib/firebase/google-integration";
import { decodeIdTokenEmail, exchangeCode } from "@/lib/google/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "google-oauth-state";

function back(req: Request, status: "connected" | "error" | "expired" | "denied"): NextResponse {
  const url = new URL("/edit", req.url);
  url.searchParams.set("google", status);
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieState = cookies().get(STATE_COOKIE)?.value;
  // Always clear the state cookie after a callback attempt.
  cookies().set({ name: STATE_COOKIE, value: "", maxAge: 0, path: "/" });

  if (error) return back(req, "denied");
  if (!code || !state) return back(req, "error");
  if (!cookieState || cookieState !== state) return back(req, "expired");

  const session = await getServerSession();
  if (!session) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("next", "/edit");
    return NextResponse.redirect(signIn);
  }

  try {
    const tokens = await exchangeCode(code);
    const email = tokens.id_token ? decodeIdTokenEmail(tokens.id_token) : null;
    await saveGoogleIntegration(session.uid, {
      accountEmail: email ?? "",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresInSeconds: tokens.expires_in,
      scope: tokens.scope,
    });
    return back(req, "connected");
  } catch (err) {
    console.error("[google/callback] exchange failed", err);
    return back(req, "error");
  }
}
