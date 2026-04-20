import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/EditorShell";
import { getServerSession } from "@/lib/firebase/session";
import { loadOwnProfile } from "@/lib/firebase/user-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar mi página",
};

export default async function EditPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const loaded = await loadOwnProfile(session.uid);
  if (!loaded) {
    // Session is valid but the user never finished onboarding.
    redirect("/onboarding");
  }

  return <EditorShell initialProfile={loaded.profile} handle={loaded.handle} />;
}
