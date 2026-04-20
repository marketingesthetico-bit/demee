import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const optionSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(60),
  multiplier: z.number().min(0).max(1000),
});

const itemSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(80),
  description: z.string().max(500),
  basePrice: z.number().nonnegative().max(1_000_000),
  unit: z.enum(["project", "hour", "month"]),
  selectable: z.boolean(),
  defaultSelected: z.boolean(),
  options: z.array(optionSchema).max(6),
});

const bodySchema = z
  .object({
    enabled: z.boolean().optional(),
    introText: z.string().max(600).optional(),
    suggestBooking: z.boolean().optional(),
    items: z.array(itemSchema).max(20).optional(),
  })
  .strict();

export async function PATCH(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid-body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(session.uid);
  const budgetRef = userRef.collection("budget").doc("main");

  let handle: string | undefined;
  try {
    const userSnap = await userRef.get();
    handle = userSnap.exists ? (userSnap.data()?.handle as string | undefined) : undefined;
    await budgetRef.set(
      { ...parsed.data, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  } catch (err) {
    console.error("[api/budget] update failed", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }

  if (handle) {
    try {
      revalidatePath(`/${handle}/budget`);
    } catch (err) {
      console.warn("[api/budget] revalidate failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
