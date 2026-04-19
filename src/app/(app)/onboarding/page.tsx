import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";

export default async function OnboardingPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userSnap = await getAdminDb().collection("users").doc(session.uid).get();
  const existingHandle = userSnap.exists ? (userSnap.data()?.handle as string | undefined) : undefined;
  if (existingHandle) {
    redirect("/dashboard");
  }

  const suggestedName = (session.name as string | undefined) ?? session.email?.split("@")[0] ?? "";

  return (
    <div className="container max-w-xl py-16">
      <OnboardingForm defaultName={suggestedName} />
    </div>
  );
}
