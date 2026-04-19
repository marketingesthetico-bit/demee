import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { getAdminDb } from "@/lib/firebase/admin";
import { validateHandleFormat } from "@/lib/constants/reserved-handles";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  handle: z.string().min(3).max(30),
  displayName: z.string().min(1).max(80),
});

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

  const db = getAdminDb();
  const handleRef = db.collection("handles").doc(handle);
  const userRef = db.collection("users").doc(session.uid);
  const profileRef = userRef.collection("profile").doc("main");

  try {
    await db.runTransaction(async (tx) => {
      const [handleSnap, userSnap] = await Promise.all([tx.get(handleRef), tx.get(userRef)]);
      if (handleSnap.exists) {
        throw new HandleTakenError();
      }
      if (userSnap.exists && userSnap.data()?.handle) {
        throw new AlreadyOnboardedError(userSnap.data()?.handle as string);
      }

      const now = FieldValue.serverTimestamp();

      tx.set(handleRef, {
        uid: session.uid,
        createdAt: now,
      });

      tx.set(userRef, {
        uid: session.uid,
        email: session.email ?? null,
        displayName: parsed.data.displayName,
        photoURL: session.picture ?? null,
        handle,
        plan: "free",
        stripeCustomerId: null,
        createdAt: now,
        updatedAt: now,
      });

      tx.set(profileRef, {
        header: {
          name: parsed.data.displayName,
          headline: "Freelance — aún perfilando mis servicios.",
          location: null,
          availability: "available",
          photoURL: session.picture ?? null,
        },
        about: { bio: "", skills: [] },
        services: [],
        portfolio: [],
        testimonials: [],
        faq: [],
        contact: {
          email: session.email ?? null,
          phone: null,
          social: {
            linkedin: null,
            twitter: null,
            instagram: null,
            github: null,
            behance: null,
            dribbble: null,
            website: null,
          },
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
