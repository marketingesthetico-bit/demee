import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminAuth } from "@/lib/firebase/admin";
import { createSessionCookie, sessionCookieOptions } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  idToken: z.string().min(20),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(parsed.data.idToken, true);
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - decoded.auth_time * 1000 > fiveMinutes) {
      return NextResponse.json({ error: "stale-id-token" }, { status: 401 });
    }

    const cookie = await createSessionCookie(parsed.data.idToken);
    cookies().set({ ...sessionCookieOptions(), value: cookie });
    return NextResponse.json({ ok: true, uid: decoded.uid });
  } catch (err) {
    console.error("[auth/session] mint failed", err);
    return NextResponse.json({ error: "mint-failed" }, { status: 401 });
  }
}

export async function DELETE() {
  cookies().set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
