import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/firebase/session";
import { loadAnalyticsSummary, type Bucket } from "@/lib/firebase/analytics-stats";
import { cn } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Analytics" };

function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AnalyticsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const summary = await loadAnalyticsSummary(session.uid);
  const buckets = [summary.thisMonth, summary.lastMonth, summary.last90d, summary.allTime];

  return (
    <div className="container max-w-5xl space-y-10 py-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">Analytics</h1>
        <p className="text-sm text-ink/60">
          Una mirada rápida a cómo está rindiendo tu página. Métricas de visitas llegarán más
          adelante.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">
          Solicitudes y reservas por período
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {buckets.map((b) => (
            <BucketCard key={b.label} bucket={b} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Estado de los leads">
          <ul className="space-y-2">
            <StatusRow label="Nuevos" value={summary.byStatus.new} dot="bg-mustard" />
            <StatusRow label="Vistos" value={summary.byStatus.viewed} dot="bg-olive-400" />
            <StatusRow label="Respondidos" value={summary.byStatus.replied} dot="bg-success" />
            <StatusRow label="Cerrados" value={summary.byStatus.closed} dot="bg-ink/30" />
          </ul>
        </Panel>

        <Panel title="Estado de las reservas">
          <ul className="space-y-2">
            <StatusRow
              label="Confirmadas"
              value={summary.bookingsByStatus.confirmed}
              dot="bg-success"
            />
            <StatusRow
              label="Canceladas"
              value={summary.bookingsByStatus.cancelled}
              dot="bg-danger"
            />
            <StatusRow
              label="Completadas"
              value={summary.bookingsByStatus.completed}
              dot="bg-olive-400"
            />
          </ul>
        </Panel>

        <Panel title="Conversión aproximada">
          <p className="text-sm text-ink/70">
            {summary.conversionHint > 0
              ? `De cada ${summary.conversionHint} leads obtienes 1 reunión.`
              : "Todavía no hay suficientes datos para calcular la conversión."}
          </p>
        </Panel>

        <Panel title="Próximamente">
          <ul className="space-y-1.5 text-sm text-ink/60">
            <li>· Visitas a tu página por día</li>
            <li>· Fuentes de tráfico (directo, redes, referer)</li>
            <li>· Funnel: visita → CTA → lead → reunión</li>
            <li>· Heatmap ligero (Pro)</li>
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function BucketCard({ bucket }: { bucket: Bucket }) {
  return (
    <div className="space-y-2 rounded-lg border border-ink/10 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-ink/50">
        {bucket.label}
      </div>
      <div className="flex items-baseline gap-4">
        <div>
          <div className="font-display text-3xl text-ink">{bucket.leads}</div>
          <div className="text-[11px] text-ink/50">leads</div>
        </div>
        <div>
          <div className="font-display text-3xl text-ink">{bucket.bookings}</div>
          <div className="text-[11px] text-ink/50">reservas</div>
        </div>
      </div>
      <div className="text-xs text-ink/60">Valor aprox.: {euro(bucket.revenue)}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border border-ink/10 bg-white p-6">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {children}
    </div>
  );
}

function StatusRow({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-ink/70">
        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
        {label}
      </span>
      <span className="font-medium text-ink">{value}</span>
    </li>
  );
}
