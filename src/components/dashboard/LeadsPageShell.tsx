"use client";

import { useState } from "react";

import type { BudgetConfig } from "@/lib/budget/types";

import { BudgetSettings } from "./BudgetSettings";
import { LeadsList, type ClientLead } from "./LeadsList";
import { TabBar, type TabDef } from "./TabBar";

type Tab = "leads" | "settings";

const TABS: readonly TabDef<Tab>[] = [
  { value: "leads", label: "Leads" },
  { value: "settings", label: "Ajustes" },
];

interface Props {
  initialLeads: ClientLead[];
  initialConfig: BudgetConfig;
  handle: string;
}

/**
 * Client wrapper for /leads. Switches between the received-requests
 * list and the budget module configuration. Settings were lifted out
 * of /edit so each module owns its own config surface in the same
 * place where its results live.
 */
export function LeadsPageShell({ initialLeads, initialConfig, handle }: Props) {
  const [tab, setTab] = useState<Tab>("leads");

  return (
    <div className="space-y-6">
      <TabBar<Tab> value={tab} onChange={setTab} tabs={TABS} />

      {tab === "leads" ? (
        <LeadsList initialLeads={initialLeads} />
      ) : (
        <BudgetSettings initialConfig={initialConfig} handle={handle} />
      )}
    </div>
  );
}
