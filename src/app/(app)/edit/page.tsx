import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/EditorShell";
import type { GoogleConnectionStatus } from "@/components/editor/GoogleCalendarConnect";
import type { SupportedIndustry } from "@/lib/industries";
import { getServerSession } from "@/lib/firebase/session";
import { loadOwnBookingConfig } from "@/lib/firebase/booking-loader";
import { loadOwnBudget } from "@/lib/firebase/budget-loader";
import { loadGoogleIntegration } from "@/lib/firebase/google-integration";
import { loadOwnProfile } from "@/lib/firebase/user-profile";
import { isGoogleOAuthConfigured } from "@/lib/google/oauth";

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

  const [budget, booking, googleIntegration] = await Promise.all([
    loadOwnBudget(session.uid, industryForTemplate),
    loadOwnBookingConfig(session.uid),
    loadGoogleIntegration(session.uid),
  ]);

  const googleStatus: GoogleConnectionStatus = {
    connected:
      Boolean(googleIntegration) &&
      Boolean(googleIntegration?.refreshToken),
    accountEmail: googleIntegration?.accountEmail ?? null,
    connectedAt: googleIntegration?.connectedAt ?? null,
    configured: isGoogleOAuthConfigured(),
  };

  return (
    <EditorShell
      initialProfile={loaded.profile}
      initialBudget={budget}
      initialBooking={booking}
      initialGoogleStatus={googleStatus}
      handle={loaded.handle}
    />
  );
}
