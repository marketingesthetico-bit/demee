import { NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";
import { appUrl, getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Creates a Stripe Billing Portal session so the user can manage
 * payment method, invoices, or cancel their subscription. Stripe
 * hosts the entire UI; we just hand over a URL with a return path
 * that brings the user back to /settings.
 */
export async function POST() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const userSnap = await getAdminDb()
    .collection("users")
    .doc(session.uid)
    .get();
  if (!userSnap.exists) {
    return NextResponse.json({ error: "user-not-found" }, { status: 404 });
  }
  const customerId = userSnap.data()?.stripeCustomerId as string | null | undefined;
  if (!customerId) {
    // Shouldn't happen if the UI only surfaces this button to Pro
    // users, but guard anyway.
    return NextResponse.json({ error: "no-customer" }, { status: 400 });
  }

  let portal;
  try {
    portal = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: appUrl("/settings"),
    });
  } catch (err) {
    console.error("[stripe/portal] session.create failed", err);
    return NextResponse.json({ error: "stripe-error" }, { status: 502 });
  }

  return NextResponse.json({ url: portal.url });
}
