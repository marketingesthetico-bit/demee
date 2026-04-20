import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BookingsList } from "@/components/dashboard/BookingsList";
import { getServerSession } from "@/lib/firebase/session";
import { loadBookingsForOwner } from "@/lib/firebase/booking-loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Agenda" };

export default async function BookingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const bookings = await loadBookingsForOwner(session.uid);

  return (
    <div className="container max-w-5xl space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">Agenda</h1>
        <p className="text-sm text-ink/60">
          Llamadas reservadas desde{" "}
          <code className="font-mono">demee.app/tuhandle/book</code>.
        </p>
      </header>
      <BookingsList initialBookings={bookings} />
    </div>
  );
}
