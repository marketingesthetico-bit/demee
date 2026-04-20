"use client";

import { useState } from "react";

import type { GoogleConnectionStatus } from "@/components/editor/GoogleCalendarConnect";
import type { BookingConfig } from "@/lib/booking/types";
import type { LoadedBooking } from "@/lib/firebase/booking-loader";

import { BookingSettings } from "./BookingSettings";
import { BookingsList } from "./BookingsList";
import { TabBar, type TabDef } from "./TabBar";

type Tab = "agenda" | "settings";

const TABS: readonly TabDef<Tab>[] = [
  { value: "agenda", label: "Agenda" },
  { value: "settings", label: "Ajustes" },
];

interface Props {
  initialBookings: LoadedBooking[];
  initialConfig: BookingConfig;
  googleStatus: GoogleConnectionStatus;
  handle: string;
}

/**
 * Client wrapper for /bookings. Switches between the reservation list
 * and the booking configuration (durations, availability, Google
 * Calendar). Settings were lifted out of /edit so the agenda module
 * owns its own configuration surface — same pattern as /leads.
 */
export function BookingsPageShell({
  initialBookings,
  initialConfig,
  googleStatus,
  handle,
}: Props) {
  const [tab, setTab] = useState<Tab>("agenda");

  return (
    <div className="space-y-6">
      <TabBar<Tab> value={tab} onChange={setTab} tabs={TABS} />

      {tab === "agenda" ? (
        <BookingsList initialBookings={initialBookings} />
      ) : (
        <BookingSettings
          initialConfig={initialConfig}
          googleStatus={googleStatus}
          handle={handle}
        />
      )}
    </div>
  );
}
