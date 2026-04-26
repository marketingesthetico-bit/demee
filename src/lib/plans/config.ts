import type { Plan } from "@/types/user";

/**
 * Single source of truth for what each plan unlocks. Quota numbers are
 * the *monthly* (UTC calendar month) caps for received budget requests
 * and booked meetings. `null` means unlimited.
 *
 * Feature flags are forward-looking — gates that the rest of the app
 * reads when a user requests the feature. Some of those features
 * (custom domain, branding removal, multiple booking types) aren't
 * built yet; the flags are still here so the gating logic lives in
 * one place from day one. Adding the actual feature later just means
 * shipping the implementation, not rewiring permissions.
 */
export interface PlanLimits {
  /** Hard cap on leads received per UTC month. `null` = unlimited. */
  monthlyLeads: number | null;
  /** Hard cap on confirmed bookings created per UTC month. `null` = unlimited. */
  monthlyBookings: number | null;
  /** Pro-only: connect a custom apex/sub domain on top of demee.app/handle. */
  allowCustomDomain: boolean;
  /** Pro-only: hide "Hecho con Demee" footer / favicon branding. */
  allowBrandingRemoval: boolean;
  /** Pro-only: more than one bookable meeting type. */
  allowMultipleBookingTypes: boolean;
  /** Pro-only: priority support. */
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    monthlyLeads: 10,
    monthlyBookings: 10,
    allowCustomDomain: false,
    allowBrandingRemoval: false,
    allowMultipleBookingTypes: false,
    prioritySupport: false,
  },
  pro: {
    monthlyLeads: null,
    monthlyBookings: null,
    allowCustomDomain: true,
    allowBrandingRemoval: true,
    allowMultipleBookingTypes: true,
    prioritySupport: true,
  },
  // Studio (agencias) is reserved for future multi-profile use. For now
  // it inherits Pro's behaviour so existing data stays valid; UI surfaces
  // it as "Pro" until the multi-profile features land.
  studio: {
    monthlyLeads: null,
    monthlyBookings: null,
    allowCustomDomain: true,
    allowBrandingRemoval: true,
    allowMultipleBookingTypes: true,
    prioritySupport: true,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

/**
 * UTC start-of-month for the given instant. Both quota counters use
 * this to demarcate the billing window — UTC instead of the user's
 * local timezone because freelancers and their visitors aren't
 * necessarily in the same one and the cap should be deterministic.
 */
export function startOfUtcMonth(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

/**
 * UTC start-of-next-month — the moment quotas reset. Useful for
 * formatting "vuelve a 0 el 1 de <mes que viene>" hints.
 */
export function startOfNextUtcMonth(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}
