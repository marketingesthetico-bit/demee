import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const aestheticSchema = z.enum(["minimal", "editorial", "bold"]);
const availabilitySchema = z.enum(["available", "limited", "closed"]);
const sectionKeySchema = z.enum([
  "header",
  "about",
  "services",
  "gallery",
  "portfolio",
  "testimonials",
  "faq",
  "contact",
]);

const imageRefSchema = z.object({
  url: z.string().url().max(1000),
  path: z.string().min(1).max(500),
});

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const themeColorsSchema = z.object({
  bg: hexColorSchema.nullable().optional(),
  fg: hexColorSchema.nullable().optional(),
  muted: hexColorSchema.nullable().optional(),
  accent: hexColorSchema.nullable().optional(),
});

const socialSchema = z.object({
  linkedin: z.string().max(200).nullable().optional(),
  twitter: z.string().max(200).nullable().optional(),
  instagram: z.string().max(200).nullable().optional(),
  github: z.string().max(200).nullable().optional(),
  behance: z.string().max(200).nullable().optional(),
  dribbble: z.string().max(200).nullable().optional(),
  website: z.string().max(200).nullable().optional(),
});

/**
 * Patch shape. Every top-level field is optional — clients send only
 * what changed. Each field is fully validated if present.
 */
const patchSchema = z
  .object({
    aesthetic: aestheticSchema.optional(),
    defaultSections: z.array(sectionKeySchema).max(20).optional(),
    published: z.boolean().optional(),
    header: z
      .object({
        name: z.string().min(1).max(80).optional(),
        headline: z.string().max(200).optional(),
        location: z.string().max(120).nullable().optional(),
        availability: availabilitySchema.optional(),
        photoURL: z.string().url().max(1000).nullable().optional(),
        photoPath: z.string().max(500).nullable().optional(),
      })
      .optional(),
    about: z
      .object({
        bio: z.string().max(1200).optional(),
        skills: z.array(z.string().min(1).max(60)).max(12).optional(),
      })
      .optional(),
    services: z
      .array(
        z.object({
          name: z.string().min(1).max(80),
          description: z.string().max(280),
          priceFrom: z.number().nonnegative().nullable().optional(),
          unit: z.enum(["project", "hour", "month"]).nullable().optional(),
        }),
      )
      .max(10)
      .optional(),
    portfolio: z
      .array(
        z.object({
          title: z.string().min(1).max(120),
          description: z.string().max(280),
          link: z.string().url().nullable().optional(),
          image: imageRefSchema.nullable().optional(),
        }),
      )
      .max(12)
      .optional(),
    gallery: z.array(imageRefSchema).max(8).optional(),
    contact: z
      .object({
        email: z.string().email().nullable().optional(),
        phone: z.string().max(40).nullable().optional(),
        social: socialSchema.optional(),
      })
      .optional(),
    themeColors: themeColorsSchema.optional(),
  })
  .strict();

/**
 * Flattens a nested patch into Firestore dotted field updates so we
 * don't overwrite sibling subfields. e.g. a patch `{ header: { bio } }`
 * becomes `{ "header.bio": "..." }` instead of replacing the whole
 * header map.
 *
 * Top-level arrays (services, portfolio, gallery) ARE replaced wholesale
 * — callers should always send the full array they want to persist.
 */
function flattenForFirestore(
  patch: z.infer<typeof patchSchema>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (patch.aesthetic !== undefined) out.aesthetic = patch.aesthetic;
  if (patch.defaultSections !== undefined) out.defaultSections = patch.defaultSections;
  if (patch.published !== undefined) out.published = patch.published;

  if (patch.header) {
    for (const [k, v] of Object.entries(patch.header)) {
      if (v !== undefined) out[`header.${k}`] = v;
    }
  }
  if (patch.about) {
    if (patch.about.bio !== undefined) out["about.bio"] = patch.about.bio;
    if (patch.about.skills !== undefined) out["about.skills"] = patch.about.skills;
  }
  if (patch.services !== undefined) out.services = patch.services;
  if (patch.portfolio !== undefined) out.portfolio = patch.portfolio;
  if (patch.gallery !== undefined) out.gallery = patch.gallery;
  if (patch.contact) {
    if (patch.contact.email !== undefined) out["contact.email"] = patch.contact.email;
    if (patch.contact.phone !== undefined) out["contact.phone"] = patch.contact.phone;
    if (patch.contact.social !== undefined) out["contact.social"] = patch.contact.social;
  }
  if (patch.themeColors !== undefined) out.themeColors = patch.themeColors;

  return out;
}

export async function PATCH(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid-body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates = flattenForFirestore(parsed.data);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, noop: true });
  }

  const db = getAdminDb();
  const userRef = db.collection("users").doc(session.uid);
  const profileRef = userRef.collection("profile").doc("main");

  let handle: string | undefined;
  try {
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "no-profile" }, { status: 404 });
    }
    handle = userSnap.data()?.handle as string | undefined;

    await profileRef.update({ ...updates, updatedAt: FieldValue.serverTimestamp() });
  } catch (err) {
    console.error("[api/profile] update failed", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }

  // Revalidate the public page so ISR picks up the change on next visit.
  if (handle) {
    try {
      revalidatePath(`/${handle}`);
    } catch (err) {
      console.warn("[api/profile] revalidate failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
