import "server-only";

import Stripe from "stripe";

/**
 * Singleton Stripe client. Lives only on the server — `server-only`
 * blocks accidental client imports that would leak the secret key.
 *
 * The API version is pinned explicitly. Stripe rolls out non-breaking
 * versions every couple of months; pinning means our integration only
 * ever sees the schema we wrote against, regardless of what default
 * the npm package picks up across upgrades.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  _stripe = new Stripe(key, {
    // Pin to the version the installed SDK ships against. Bumping the
    // SDK package is the moment to also bump this string and re-test.
    apiVersion: "2025-02-24.acacia",
    typescript: true,
    appInfo: {
      name: "demee",
      version: "0.0.0",
      url: process.env.NEXT_PUBLIC_APP_URL ?? "https://demee.app",
    },
  });
  return _stripe;
}

/**
 * Stripe subscription statuses that should keep the user on Pro. We
 * deliberately keep `past_due` here: Stripe retries failed charges 3×
 * over ~30 days before downgrading the subscription to `unpaid` /
 * `canceled`, and during that window the user shouldn't lose Pro
 * features mid-conversation. The terminal states downgrade them.
 */
const PRO_STATUSES: ReadonlySet<Stripe.Subscription.Status> = new Set([
  "active",
  "trialing",
  "past_due",
]);

export function statusGrantsPro(status: Stripe.Subscription.Status): boolean {
  return PRO_STATUSES.has(status);
}

/**
 * URL helper — Stripe's `success_url` / `cancel_url` / `return_url`
 * must be absolute. We base everything off `NEXT_PUBLIC_APP_URL`,
 * which is set per-environment in Vercel.
 */
export function appUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://demee.app").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
