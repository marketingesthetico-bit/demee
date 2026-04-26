import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LeadsPageShell } from "@/components/dashboard/LeadsPageShell";
import { PlanUsageBadge } from "@/components/dashboard/PlanUsageBadge";
import { loadOwnBudget } from "@/lib/firebase/budget-loader";
import { loadLeadsForOwner } from "@/lib/firebase/leads-loader";
import { getServerSession } from "@/lib/firebase/session";
import { loadOwnProfile } from "@/lib/firebase/user-profile";
import type { SupportedIndustry } from "@/lib/industries";
import { checkLeadQuota } from "@/lib/plans/quotas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leads" };

// Mirrors the whitelist used by /edit so the template fallback only
// kicks in for industries we actually ship defaults for.
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

export default async function LeadsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const owner = await loadOwnProfile(session.uid);
  if (!owner) redirect("/onboarding");

  const industryForTemplate = SUPPORTED_INDUSTRIES.includes(
    owner.profile.industry as SupportedIndustry,
  )
    ? (owner.profile.industry as SupportedIndustry)
    : null;

  const [leads, budget, quota] = await Promise.all([
    loadLeadsForOwner(session.uid),
    loadOwnBudget(session.uid, industryForTemplate),
    checkLeadQuota(session.uid),
  ]);

  // Firestore Timestamps can't cross the Server/Client boundary — coerce
  // to ISO here before handing the list to the client shell.
  const plainLeads = leads.map((lead) => ({
    ...lead,
    createdAt: lead.createdAt ? lead.createdAt.toISOString() : null,
  }));

  return (
    <div className="container max-w-5xl space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">Leads</h1>
        <p className="text-sm text-ink/60">
          Solicitudes de presupuesto que llegan desde{" "}
          <code className="font-mono">demee.app/{owner.handle}/budget</code>.
        </p>
      </header>
      <PlanUsageBadge kind="leads" used={quota.used} limit={quota.limit} />
      <LeadsPageShell
        initialLeads={plainLeads}
        initialConfig={budget}
        handle={owner.handle}
      />
    </div>
  );
}
