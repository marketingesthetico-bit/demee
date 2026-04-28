import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";

import { getAdminDb } from "@/lib/firebase/admin";
import { getStripe, statusGrantsPro } from "@/lib/stripe/client";
import type { Plan, SubscriptionStatus } from "@/types/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook receiver. Three event types are wired:
 *
 *   - `checkout.session.completed`     → flip the user to Pro, save
 *                                         customer + subscription IDs.
 *   - `customer.subscription.updated`  → reflect the new status; downgrade
 *                                         to Free if Stripe says so.
 *   - `customer.subscription.deleted`  → terminal cancel → Free.
 *
 * Signature verification uses the raw request body — Next.js doesn't
 * give us that out of the box, so we read with `request.text()` and
 * pass the unparsed string to `stripe.webhooks.constructEvent`.
 *
 * Every handler is idempotent: Stripe retries on non-2xx, and we want
 * receiving the same event twice to be a no-op. All writes go through
 * `set({...}, { merge: true })` and only update fields the event
 * actually carries.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "not-configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing-signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[stripe/webhook] signature verification failed", message);
    return NextResponse.json({ error: "invalid-signature" }, { status: 400 });
  }

  console.log(`[stripe/webhook] received event ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(
          event.data.object as Stripe.Subscription,
          event.type === "customer.subscription.deleted",
        );
        break;
      default:
        // Other events are subscribed only on Stripe's side. We ack
        // to keep the dashboard delivery rate green, but no-op here.
        break;
    }
  } catch (err) {
    // Fail loudly so Stripe retries — but only on our own bugs, not
    // signature problems (handled above).
    console.error(`[stripe/webhook] handler failed for ${event.type}`, err);
    return NextResponse.json({ error: "handler-failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Path 1: visitor completed Stripe Checkout. The session carries
 * `client_reference_id` (the uid we set when creating the session)
 * plus the new subscription + customer IDs. We pin the user to Pro
 * here so the success page renders the new state immediately even if
 * the subscription event hasn't arrived yet.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const uid = session.client_reference_id;
  if (!uid) {
    console.warn(
      "[stripe/webhook] checkout.session.completed without client_reference_id",
      session.id,
    );
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? null);
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription?.id ?? null);

  // Subscription mode + paid → user is on Pro from this moment.
  await updateUserPlan(uid, "pro", {
    customerId,
    subscriptionId,
    status: "active",
  });
}

/**
 * Path 2: subscription lifecycle. Used for renewals, status flips
 * (active → past_due → canceled), and the terminal "deleted" event.
 *
 * We resolve the freelancer uid in three escalating steps:
 *   - subscription.metadata.uid  (set when we created the checkout)
 *   - customer.metadata.uid      (set when we created the customer)
 *   - users where stripeCustomerId == X  (single-field index, auto-created)
 *
 * Three steps because Stripe subscriptions can theoretically be
 * created via Billing Portal flows that don't carry our metadata, and
 * we want the gate to keep working in all of them.
 */
async function handleSubscriptionEvent(
  subscription: Stripe.Subscription,
  deleted: boolean,
) {
  const uid = await resolveUidForSubscription(subscription);
  if (!uid) {
    console.warn(
      "[stripe/webhook] could not resolve uid for subscription",
      subscription.id,
    );
    return;
  }

  const status: SubscriptionStatus = deleted ? "canceled" : subscription.status;
  const plan: Plan = !deleted && statusGrantsPro(subscription.status) ? "pro" : "free";

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  await updateUserPlan(uid, plan, {
    customerId,
    subscriptionId: subscription.id,
    status,
  });
}

async function resolveUidForSubscription(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromSub = subscription.metadata?.uid;
  if (fromSub) return fromSub;

  // Customer object is shallow on the event payload — fetch it to read
  // metadata if we need to (rare path, only when subscription metadata
  // is missing).
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if (!customer.deleted && customer.metadata?.uid) return customer.metadata.uid;
  } catch (err) {
    console.warn("[stripe/webhook] customer.retrieve failed", err);
  }

  // Last resort: query Firestore by stripeCustomerId.
  const db = getAdminDb();
  const snap = await db
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();
  if (!snap.empty) return snap.docs[0]!.id;

  return null;
}

async function updateUserPlan(
  uid: string,
  plan: Plan,
  extras: {
    customerId?: string | null;
    subscriptionId?: string | null;
    status?: SubscriptionStatus | null;
  },
) {
  const data: Record<string, unknown> = {
    plan,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (extras.customerId) data.stripeCustomerId = extras.customerId;
  if (extras.subscriptionId) data.stripeSubscriptionId = extras.subscriptionId;
  if (extras.status) data.stripeSubscriptionStatus = extras.status;

  await getAdminDb().collection("users").doc(uid).set(data, { merge: true });
  console.log(
    `[stripe/webhook] users/${uid} → plan=${plan}` +
      (extras.status ? ` status=${extras.status}` : ""),
  );
}
