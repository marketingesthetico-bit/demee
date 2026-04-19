import { NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebase/admin";
import { validateHandleFormat } from "@/lib/constants/reserved-handles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckResult =
  | { available: true }
  | {
      available: false;
      reason: "too-short" | "too-long" | "invalid-chars" | "starts-or-ends-with-hyphen" | "reserved" | "taken";
    };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("handle") ?? "";
  const handle = raw.trim().toLowerCase();

  const format = validateHandleFormat(handle);
  if (!format.valid) {
    return NextResponse.json<CheckResult>({ available: false, reason: format.reason! });
  }

  const snap = await getAdminDb().collection("handles").doc(handle).get();
  if (snap.exists) {
    return NextResponse.json<CheckResult>({ available: false, reason: "taken" });
  }

  return NextResponse.json<CheckResult>({ available: true });
}
