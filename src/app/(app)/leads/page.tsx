import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LeadsList } from "@/components/dashboard/LeadsList";
import { getServerSession } from "@/lib/firebase/session";
import { loadLeadsForOwner } from "@/lib/firebase/leads-loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const leads = await loadLeadsForOwner(session.uid);
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
          <code className="font-mono">demee.app/tuhandle/budget</code>.
        </p>
      </header>
      <LeadsList initialLeads={plainLeads} />
    </div>
  );
}
