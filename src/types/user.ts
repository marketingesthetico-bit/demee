export type Plan = "free" | "pro" | "studio";

/**
 * Last-known Stripe subscription state. Mirrors a subset of
 * `Stripe.Subscription.Status` — kept loose so SDK upgrades that
 * introduce new statuses don't break our types until we actually
 * decide how to handle them.
 */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  handle: string;
  plan: Plan;
  /** Set on first checkout. Stable across cancel/resubscribe cycles. */
  stripeCustomerId: string | null;
  /** Most recent subscription. `null` while the user has never paid. */
  stripeSubscriptionId: string | null;
  /** Mirrors Stripe's last known status for this subscription. */
  stripeSubscriptionStatus: SubscriptionStatus | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HandleReservation {
  handle: string;
  uid: string;
  createdAt: Date;
}
