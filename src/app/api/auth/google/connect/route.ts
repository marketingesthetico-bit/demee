import { randomBytes } from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/firebase/session";
import { buildAuthUrl, isGoogleOAuthConfigured } from "@/lib/google/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "google-oauth-state";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("next", "/edit");
    return NextResponse.redirect(url);
  }
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/edit?google=not-configured", req.url));
  }

  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(buildAuthUrl(state));
  cookies().set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min
  });
  return res;
}
