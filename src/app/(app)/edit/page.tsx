import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/EditorShell";
import type { SupportedIndustry } from "@/lib/industries";
import { getServerSession } from "@/lib/firebase/session";
import { loadOwnBudget } from "@/lib/firebase/budget-loader";
import { loadOwnProfile } from "@/lib/firebase/user-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar mi página",
};

const SUPPORTED_INDUSTRIES: readonly SupportedIndustry[] = [
  "graphic-designer",
  "developer",
  "ux-designer",
  "photographer",
  "copywriter",
  "coach",
  "marketing-consultant",
  "architect",
] as const;

export default async function EditPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const loaded = await loadOwnProfile(session.uid);
  if (!loaded) redirect("/onboarding");

  const industryForTemplate = SUPPORTED_INDUSTRIES.includes(
    loaded.profile.industry as SupportedIndustry,
  )
    ? (loaded.profile.industry as SupportedIndustry)
    : null;

  const budget = await loadOwnBudget(session.uid, industryForTemplate);

  return (
    <EditorShell
      initialProfile={loaded.profile}
      initialBudget={budget}
      handle={loaded.handle}
    />
  );
}
