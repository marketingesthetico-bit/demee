import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/firebase/session";
import { loadOwnProfile } from "@/lib/firebase/user-profile";
import { getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ajustes" };

async function loadPlan(uid: string): Promise<"free" | "pro" | "studio"> {
  const snap = await getAdminDb().collection("users").doc(uid).get();
  const raw = snap.exists ? (snap.data()?.plan as string | undefined) : undefined;
  return raw === "pro" || raw === "studio" ? raw : "free";
}

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const [loaded, plan] = await Promise.all([
    loadOwnProfile(session.uid),
    loadPlan(session.uid),
  ]);

  if (!loaded) redirect("/onboarding");

  return (
    <div className="container max-w-3xl space-y-10 py-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">Ajustes</h1>
        <p className="text-sm text-ink/60">Cuenta, plan y preferencias.</p>
      </header>

      <Panel title="Cuenta">
        <Row label="Email" value={loaded.email ?? "—"} />
        <Row
          label="Handle"
          value={`demee.app/${loaded.handle}`}
          hint="Cambiar el handle llegará en Pro con un redirect 301 de 30 días desde el anterior."
        />
        <Row
          label="Nombre público"
          value={loaded.profile.header.name}
          hint="Edítalo desde Mi página."
          actionHref="/edit"
          actionLabel="Ir al editor"
        />
      </Panel>

      <Panel title="Plan">
        <Row
          label="Plan actual"
          value={
            plan === "pro"
              ? "Pro (7 €/mes)"
              : plan === "studio"
                ? "Studio"
                : "Free"
          }
          hint={
            plan === "free"
              ? "Pro desbloquea dominio propio, sin marca Demee, leads ilimitados, agenda múltiple y más."
              : "Gestiona tu suscripción en el portal de Stripe cuando esté activo."
          }
        />
        {plan === "free" && (
          <div className="pt-2">
            <button
              type="button"
              disabled
              className="rounded-md bg-ink/20 px-4 py-2 text-sm font-medium text-ink/50"
            >
              Pasar a Pro (pronto)
            </button>
          </div>
        )}
      </Panel>

      <Panel title="Peligro">
        <p className="text-sm text-ink/70">
          Cerrar sesión en este dispositivo o solicitar la eliminación permanente de tu cuenta.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="/api/auth/logout"
            className="rounded-md border border-ink/15 bg-white px-4 py-2 text-sm text-ink hover:bg-ink/5"
          >
            Cerrar sesión
          </a>
          <button
            type="button"
            disabled
            className="rounded-md border border-danger/30 bg-danger/5 px-4 py-2 text-sm text-danger/70"
            title="Disponible pronto con confirmación + soft-delete de 30 días"
          >
            Eliminar cuenta (pronto)
          </button>
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-6">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  hint,
  actionHref,
  actionLabel,
}: {
  label: string;
  value: string;
  hint?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/5 pb-3 last:border-b-0 last:pb-0">
      <div className="min-w-0 space-y-1">
        <div className="text-xs font-medium uppercase tracking-wide text-ink/50">
          {label}
        </div>
        <div className="truncate font-mono text-sm text-ink">{value}</div>
        {hint && <div className="text-xs text-ink/50">{hint}</div>}
      </div>
      {actionHref && actionLabel && (
        <a
          href={actionHref}
          className="shrink-0 rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink/70 hover:border-ink/30 hover:text-ink"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
