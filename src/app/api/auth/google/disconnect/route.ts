import { NextResponse } from "next/server";

import {
  deleteGoogleIntegration,
  loadGoogleIntegration,
} from "@/lib/firebase/google-integration";
import { getServerSession } from "@/lib/firebase/session";
import { revokeToken } from "@/lib/google/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const integration = await loadGoogleIntegration(session.uid);
  if (integration?.refreshToken) {
    await revokeToken(integration.refreshToken);
  }
  await deleteGoogleIntegration(session.uid);
  return NextResponse.json({ ok: true });
}
