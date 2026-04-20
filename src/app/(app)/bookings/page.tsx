import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BookingsPageShell } from "@/components/dashboard/BookingsPageShell";
import type { GoogleConnectionStatus } from "@/components/editor/GoogleCalendarConnect";
import { loadBookingsForOwner, loadOwnBookingConfig } from "@/lib/firebase/booking-loader";
import { loadGoogleIntegration } from "@/lib/firebase/google-integration";
import { getServerSession } from "@/lib/firebase/session";
import { loadOwnProfile } from "@/lib/firebase/user-profile";
import { isGoogleOAuthConfigured } from "@/lib/google/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Agenda" };

export default async function BookingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  // Need the handle to render the "demee.app/<handle>/book" link in the
  // settings tab — loadOwnProfile also doubles as the onboarding-done guard.
  const owner = await loadOwnProfile(session.uid);
  if (!owner) redirect("/onboarding");

  const [bookings, bookingConfig, googleIntegration] = await Promise.all([
    loadBookingsForOwner(session.uid),
    loadOwnBookingConfig(session.uid),
    loadGoogleIntegration(session.uid),
  ]);

  const googleStatus: GoogleConnectionStatus = {
    connected:
      Boolean(googleIntegration) && Boolean(googleIntegration?.refreshToken),
    accountEmail: googleIntegration?.accountEmail ?? null,
    connectedAt: googleIntegration?.connectedAt ?? null,
    configured: isGoogleOAuthConfigured(),
  };

  return (
    <div className="container max-w-5xl space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">Agenda</h1>
        <p className="text-sm text-ink/60">
          Llamadas reservadas desde{" "}
          <code className="font-mono">demee.app/{owner.handle}/book</code>.
        </p>
      </header>
      <BookingsPageShell
        initialBookings={bookings}
        initialConfig={bookingConfig}
        googleStatus={googleStatus}
        handle={owner.handle}
      />
    </div>
  );
}
