import { redirect } from "next/navigation";

import { StepperBar } from "@/components/onboarding/StepperBar";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";

export const runtime = "nodejs";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userSnap = await getAdminDb().collection("users").doc(session.uid).get();
  const existingHandle = userSnap.exists ? (userSnap.data()?.handle as string | undefined) : undefined;
  if (existingHandle) {
    redirect("/dashboard");
  }

  return (
    <div className="container max-w-3xl">
      <StepperBar />
      <div className="py-8">{children}</div>
    </div>
  );
}
