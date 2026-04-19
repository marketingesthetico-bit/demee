export type Plan = "free" | "pro" | "studio";

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  handle: string;
  plan: Plan;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HandleReservation {
  handle: string;
  uid: string;
  createdAt: Date;
}
