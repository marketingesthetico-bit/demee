import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    status: z.enum(["confirmed", "cancelled", "completed"]),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection("bookings").doc(params.id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if ((snap.data()?.ownerUid as string | undefined) !== session.uid) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await ref.update({ status: parsed.data.status });
  return NextResponse.json({ ok: true });
}
