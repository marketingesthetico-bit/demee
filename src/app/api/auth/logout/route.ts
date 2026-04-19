import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sessionCookieOptions } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  cookies().set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
  return NextResponse.redirect(new URL("/", req.url));
}
