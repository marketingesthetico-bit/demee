import "server-only";

import type { Aesthetic, Industry } from "@/types/profile";

import { getAdminDb } from "./admin";

export interface PublicProfile {
  uid: string;
  handle: string;
  industry: Industry;
  aesthetic: Aesthetic;
  header: {
    name: string;
    headline: string;
    location: string | null;
    availability: "available" | "limited" | "closed";
    photoURL: string | null;
  };
  about: { bio: string; skills: string[] };
  contact: { email: string | null };
}

export async function getPublicProfileByHandle(handle: string): Promise<PublicProfile | null> {
  const db = getAdminDb();
  const handleSnap = await db.collection("handles").doc(handle).get();
  if (!handleSnap.exists) return null;

  const uid = handleSnap.data()?.uid as string | undefined;
  if (!uid) return null;

  const profileSnap = await db.collection("users").doc(uid).collection("profile").doc("main").get();
  if (!profileSnap.exists) return null;

  const data = profileSnap.data();
  if (!data || data.published !== true) return null;

  return {
    uid,
    handle,
    industry: (data.industry as Industry | undefined) ?? "other",
    aesthetic: (data.aesthetic as Aesthetic | undefined) ?? "minimal",
    header: {
      name: (data.header?.name as string) ?? handle,
      headline: (data.header?.headline as string) ?? "",
      location: (data.header?.location as string | null) ?? null,
      availability:
        (data.header?.availability as "available" | "limited" | "closed" | undefined) ?? "available",
      photoURL: (data.header?.photoURL as string | null) ?? null,
    },
    about: {
      bio: (data.about?.bio as string) ?? "",
      skills: (data.about?.skills as string[]) ?? [],
    },
    contact: {
      email: (data.contact?.email as string | null) ?? null,
    },
  };
}
