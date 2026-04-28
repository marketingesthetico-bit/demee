import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";
import { appUrl, getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Starts a Stripe Checkout in subscription mode.
 *
 * Flow:
 *   1. Load the freelancer's user doc.
 *   2. Reuse an existing Stripe Customer when we already have one,
 *      otherwise create a new one with `metadata.uid` (so any future
 *      subscription event from Stripe carries the link back to us).
 *   3. Create a Checkout Session for the configured Pro price.
 *   4. Return its hosted URL — the client redirects the browser there.
 *
 * The user doc gets `stripeCustomerId` saved *before* the redirect so
 * that even if the user abandons checkout we don't leak orphan
 * customers on the next attempt.
 */
export async function POST() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) {
    console.error("[stripe/checkout] STRIPE_PRICE_PRO_MONTHLY is not configured");
    return NextResponse.json({ error: "stripe-not-configured" }, { status: 500 });
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(session.uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    return NextResponse.json({ error: "user-not-found" }, { status: 404 });
  }
  const userData = userSnap.data() ?? {};

  // Already on Pro with an active subscription → no need for a new
  // checkout. Surface a 409 the client can detect.
  const currentPlan = userData.plan as string | undefined;
  const currentStatus = userData.stripeSubscriptionStatus as string | undefined;
  if (
    currentPlan === "pro" &&
    (currentStatus === "active" || currentStatus === "trialing")
  ) {
    return NextResponse.json({ error: "already-pro" }, { status: 409 });
  }

  const stripe = getStripe();
  let customerId = userData.stripeCustomerId as string | null | undefined;

  // First time → create the Stripe Customer with metadata that links
  // back to the freelancer's uid + handle. Any subscription event we
  // later receive can resolve back to this user without a query.
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: (userData.email as string | undefined) ?? session.email ?? undefined,
      name:
        (userData.displayName as string | undefined) ??
        (userData.handle as string | undefined) ??
        undefined,
      metadata: {
        uid: session.uid,
        handle: (userData.handle as string | undefined) ?? "",
      },
    });
    customerId = customer.id;
    await userRef.set(
      { stripeCustomerId: customerId, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  }

  let checkout;
  try {
    checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: session.uid,
      subscription_data: {
        metadata: {
          uid: session.uid,
          handle: (userData.handle as string | undefined) ?? "",
        },
      },
      // Stripe substitutes {CHECKOUT_SESSION_ID} with the real id —
      // we use it on /settings to confirm the upgrade synchronously
      // without waiting for the webhook to land.
      success_url: appUrl("/settings?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: appUrl("/settings?canceled=1"),
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });
  } catch (err) {
    console.error("[stripe/checkout] session.create failed", err);
    return NextResponse.json({ error: "stripe-error" }, { status: 502 });
  }

  if (!checkout.url) {
    return NextResponse.json({ error: "no-checkout-url" }, { status: 500 });
  }

  return NextResponse.json({ url: checkout.url });
}
