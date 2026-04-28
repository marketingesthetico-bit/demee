import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import { getIndustryConfig } from "@/lib/industries";
import { validateHandleFormat } from "@/lib/constants/reserved-handles";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const industrySchema = z.enum([
  "graphic-designer",
  "developer",
  "ux-designer",
  "photographer",
  "copywriter",
  "coach",
  "marketing-consultant",
  "architect",
]);
const aestheticSchema = z.enum([
  "minimal",
  "editorial",
  "bold",
  "playful",
  "corporate",
  "artistic",
]);

const imageRefSchema = z.object({
  url: z.string().url().max(1000),
  path: z.string().min(1).max(500),
});

const importedSchema = z
  .object({
    headline: z.string().max(200).optional(),
    bio: z.string().max(1200).optional(),
    skills: z.array(z.string().min(1).max(60)).max(12).optional(),
    services: z
      .array(
        z.object({
          name: z.string().min(1).max(80),
          description: z.string().max(280),
        }),
      )
      .max(10)
      .optional(),
    portfolio: z
      .array(
        z.object({
          id: z.string().min(1).max(60).optional(),
          title: z.string().min(1).max(120),
          description: z.string().max(280),
          link: z.string().url().optional(),
          image: imageRefSchema.optional(),
          createdAt: z.string().datetime().optional(),
          hasDetailPage: z.boolean().optional(),
          detail: z
            .object({
              longDescription: z.string().max(6000),
              images: z.array(imageRefSchema).max(12),
              videos: z
                .array(
                  z.object({
                    url: z.string().url().max(1000),
                    provider: z.enum(["youtube", "vimeo", "direct"]),
                  }),
                )
                .max(6),
            })
            .optional(),
        }),
      )
      .max(12)
      .optional(),
    social: z
      .object({
        linkedin: z.string().max(200).optional(),
        twitter: z.string().max(200).optional(),
        instagram: z.string().max(200).optional(),
        github: z.string().max(200).optional(),
        behance: z.string().max(200).optional(),
        dribbble: z.string().max(200).optional(),
        website: z.string().max(200).optional(),
      })
      .optional(),
    avatar: imageRefSchema.optional(),
    gallery: z.array(imageRefSchema).max(8).optional(),
  })
  .optional();

const bodySchema = z.object({
  handle: z.string().min(3).max(30),
  displayName: z.string().min(1).max(80),
  industry: industrySchema,
  aesthetic: aestheticSchema,
  imported: importedSchema,
});

type SocialKey = keyof NonNullable<
  NonNullable<z.infer<typeof importedSchema>>["social"]
>;

function buildSocial(imported: z.infer<typeof importedSchema>) {
  const keys: SocialKey[] = [
    "linkedin",
    "twitter",
    "instagram",
    "github",
    "behance",
    "dribbble",
    "website",
  ];
  const result: Record<SocialKey, string | null> = {
    linkedin: null,
    twitter: null,
    instagram: null,
    github: null,
    behance: null,
    dribbble: null,
    website: null,
  };
  if (!imported?.social) return result;
  for (const key of keys) {
    const value = imported.social[key];
    if (value) result[key] = value;
  }
  return result;
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const handle = parsed.data.handle.trim().toLowerCase();
  const format = validateHandleFormat(handle);
  if (!format.valid) {
    return NextResponse.json(
      { error: "invalid-handle", reason: format.reason },
      { status: 400 },
    );
  }

  const industryConfig = getIndustryConfig(parsed.data.industry);
  if (!industryConfig) {
    return NextResponse.json({ error: "invalid-industry" }, { status: 400 });
  }

  const db = getAdminDb();
  const handleRef = db.collection("handles").doc(handle);
  const userRef = db.collection("users").doc(session.uid);
  const profileRef = userRef.collection("profile").doc("main");

  try {
    await db.runTransaction(async (tx) => {
      const [handleSnap, userSnap] = await Promise.all([tx.get(handleRef), tx.get(userRef)]);
      if (handleSnap.exists) throw new HandleTakenError();
      if (userSnap.exists && userSnap.data()?.handle) {
        throw new AlreadyOnboardedError(userSnap.data()?.handle as string);
      }

      const now = FieldValue.serverTimestamp();
      const imported = parsed.data.imported;

      tx.set(handleRef, { uid: session.uid, createdAt: now });

      tx.set(userRef, {
        uid: session.uid,
        email: session.email ?? null,
        displayName: parsed.data.displayName,
        photoURL: session.picture ?? null,
        handle,
        plan: "free",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripeSubscriptionStatus: null,
        createdAt: now,
        updatedAt: now,
      });

      tx.set(profileRef, {
        industry: parsed.data.industry,
        aesthetic: parsed.data.aesthetic,
        defaultSections: industryConfig.defaultSections,
        header: {
          name: parsed.data.displayName,
          headline: imported?.headline ?? industryConfig.examples.headline,
          location: null,
          availability: "available",
          photoURL: imported?.avatar?.url ?? session.picture ?? null,
          photoPath: imported?.avatar?.path ?? null,
        },
        about: {
          bio: imported?.bio ?? "",
          skills: imported?.skills ?? [],
        },
        services: imported?.services ?? [],
        portfolio: (imported?.portfolio ?? []).map((item, i) => ({
          ...item,
          id: item.id ?? `p${Date.now().toString(36)}-${i}`,
          createdAt: item.createdAt ?? new Date().toISOString(),
          hasDetailPage: item.hasDetailPage ?? false,
          detail: item.detail ?? null,
        })),
        gallery: imported?.gallery ?? [],
        testimonials: [],
        faq: [],
        contact: {
          email: session.email ?? null,
          phone: null,
          social: buildSocial(imported),
        },
        published: true,
        publishedAt: now,
        updatedAt: now,
      });
    });

    return NextResponse.json({ ok: true, uid: session.uid, handle });
  } catch (err) {
    if (err instanceof HandleTakenError) {
      return NextResponse.json({ error: "taken" }, { status: 409 });
    }
    if (err instanceof AlreadyOnboardedError) {
      return NextResponse.json(
        { error: "already-onboarded", handle: err.handle },
        { status: 409 },
      );
    }
    console.error("[api/users] create failed", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }
}

class HandleTakenError extends Error {
  constructor() {
    super("handle-taken");
  }
}

class AlreadyOnboardedError extends Error {
  constructor(public handle: string) {
    super("already-onboarded");
  }
}
