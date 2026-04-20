import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/firebase/session-constants";

const PROTECTED_PREFIXES = ["/onboarding", "/dashboard", "/edit", "/leads"];
const AUTH_PAGES = new Set(["/sign-in", "/sign-up"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_PAGES.has(pathname) && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/edit/:path*",
    "/leads/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
