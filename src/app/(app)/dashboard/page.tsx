import Link from "next/link";

import { getServerSession } from "@/lib/firebase/session";
import { loadDashboardSummary } from "@/lib/firebase/dashboard-stats";
import { loadOwnProfile } from "@/lib/firebase/user-profile";
import { cn } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function madridDateShort(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}

function madridTimeShort(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
    hour12: false,
  }).format(new Date(iso));
}

function relative(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return madridDateShort(iso);
}

const LEAD_STATUS_LABEL = {
  new: "Nuevo",
  viewed: "Visto",
  replied: "Respondido",
  closed: "Cerrado",
} as const;

export default async function DashboardPage() {
  const session = await getServerSession();
  const [loaded, summary] = await Promise.all([
    session ? loadOwnProfile(session.uid) : Promise.resolve(null),
    session ? loadDashboardSummary(session.uid) : Promise.resolve(null),
  ]);

  const firstName = loaded?.profile.header.name?.split(" ")[0] ?? "freelancer";

  return (
    <div className="container max-w-5xl space-y-10 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-ink/50">Bienvenido de nuevo,</p>
          <h1 className="font-display text-4xl text-ink">Hola, {firstName}.</h1>
        </div>
        {loaded?.handle && (
          <a
            href={`/${loaded.handle}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            <span className="font-mono text-olive-700">demee.app/{loaded.handle}</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </header>

      {summary && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Leads totales"
            value={summary.leads.total}
            sub={`${summary.leads.last30d} últimos 30 días`}
            href="/leads"
          />
          <StatCard
            label="Nuevos sin ver"
            value={summary.leads.newCount}
            sub={summary.leads.newCount > 0 ? "Requieren tu atención" : "Al día"}
            href="/leads"
            accent={summary.leads.newCount > 0}
          />
          <StatCard
            label="Próximas reuniones"
            value={summary.bookings.upcoming}
            sub={`${summary.bookings.total} totales`}
            href="/bookings"
          />
          <StatCard
            label="Reservas (30d)"
            value={summary.bookings.last30d}
            sub="Crecimiento reciente"
            href="/bookings"
          />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-ink/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Últimos leads</h2>
            <Link href="/leads" className="text-xs text-olive-700 hover:underline">
              Ver todos →
            </Link>
          </div>
          {summary && summary.recentLeads.length > 0 ? (
            <ul className="divide-y divide-ink/5">
              {summary.recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="truncate text-sm font-medium text-ink">{lead.guestName}</div>
                    <div className="truncate text-xs text-ink/50">{lead.guestEmail}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium text-ink">{euro(lead.total)}</div>
                    <div className="text-ink/50">
                      {LEAD_STATUS_LABEL[lead.status]} · {relative(lead.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint
              icon="📬"
              text="No hay solicitudes todavía."
              hint="Activa el presupuestador en /edit y comparte tu página."
            />
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-ink/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Próximas reuniones</h2>
            <Link href="/bookings" className="text-xs text-olive-700 hover:underline">
              Ver todas →
            </Link>
          </div>
          {summary && summary.upcomingBookings.length > 0 ? (
            <ul className="divide-y divide-ink/5">
              {summary.upcomingBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="truncate text-sm font-medium text-ink">{b.guestName}</div>
                    <div className="truncate text-xs text-ink/50">{b.guestEmail}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium text-ink">{madridDateShort(b.startsAt)}</div>
                    <div className="text-ink/50">
                      {madridTimeShort(b.startsAt)} · {b.durationMinutes}m
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint
              icon="📅"
              text="Sin reuniones programadas."
              hint="Activa la agenda en /edit para aceptar reservas."
            />
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  href,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg border bg-white p-5 transition hover:shadow-sm",
        accent
          ? "border-mustard-400 ring-2 ring-mustard-400/20"
          : "border-ink/10 hover:border-ink/20",
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</div>
      <div className="mt-2 font-display text-3xl text-ink">{value}</div>
      <div className="mt-1 text-xs text-ink/60">{sub}</div>
    </Link>
  );
}

function EmptyHint({ icon, text, hint }: { icon: string; text: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <p className="text-sm text-ink/60">{text}</p>
      <p className="text-xs text-ink/50">{hint}</p>
    </div>
  );
}
