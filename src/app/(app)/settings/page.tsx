import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";

import { ManageSubscriptionButton } from "@/components/dashboard/ManageSubscriptionButton";
import { UpgradeProButton } from "@/components/dashboard/UpgradeProButton";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";
import { loadOwnProfile } from "@/lib/firebase/user-profile";
import { getPlanLimits } from "@/lib/plans/config";
import {
  checkBookingQuota,
  checkLeadQuota,
  loadUserPlan,
} from "@/lib/plans/quotas";
import { getStripe } from "@/lib/stripe/client";
import { cn } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ajustes" };

interface Props {
  /**
   * Stripe redirect query:
   *   ?session_id=cs_...   → just came back from a successful checkout
   *   ?canceled=1          → just bailed from the checkout
   */
  searchParams: { session_id?: string; canceled?: string };
}

export default async function SettingsPage({ searchParams }: Props) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  // Synchronously confirm a fresh upgrade before we load the rest of
  // the panel state. The webhook is the authoritative path, but this
  // makes the post-checkout page feel instant: by the time the user
  // sees /settings, plan is already "pro" without waiting on Stripe's
  // event delivery.
  let upgradedNow = false;
  if (searchParams.session_id) {
    upgradedNow = await syncUpgradeFromCheckoutSession(
      session.uid,
      searchParams.session_id,
    );
  }

  const [loaded, plan, leadQuota, bookingQuota] = await Promise.all([
    loadOwnProfile(session.uid),
    loadUserPlan(session.uid),
    checkLeadQuota(session.uid),
    checkBookingQuota(session.uid),
  ]);

  if (!loaded) redirect("/onboarding");

  const limits = getPlanLimits(plan);

  return (
    <div className="container max-w-3xl space-y-10 py-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">Ajustes</h1>
        <p className="text-sm text-ink/60">Cuenta, plan y preferencias.</p>
      </header>

      {upgradedNow && plan === "pro" && (
        <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-success">
          ¡Bienvenido a Pro! El pago se ha confirmado y ya tienes el plan
          activado.
        </div>
      )}
      {searchParams.canceled === "1" && (
        <div className="rounded-lg border border-ink/15 bg-white p-4 text-sm text-ink/70">
          Has cancelado el pago. Puedes pasar a Pro cuando quieras desde el
          panel de plan.
        </div>
      )}

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

      <PlanPanel
        plan={plan}
        leadUsed={leadQuota.used}
        bookingUsed={bookingQuota.used}
        leadLimit={limits.monthlyLeads}
        bookingLimit={limits.monthlyBookings}
      />

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

/**
 * Retrieves the Stripe Checkout Session referenced in the success URL
 * and, if it's actually paid + linked to this user, pins the user to
 * Pro right away. Idempotent — receiving the same session id twice is
 * a no-op merge. Failures are logged and swallowed: the webhook will
 * still set the plan when it lands.
 */
async function syncUpgradeFromCheckoutSession(
  uid: string,
  sessionId: string,
): Promise<boolean> {
  try {
    const checkout = await getStripe().checkout.sessions.retrieve(sessionId);
    if (checkout.client_reference_id !== uid) {
      // Defensive: a malicious user could try to claim someone else's
      // checkout by tampering with the redirect URL.
      return false;
    }
    if (checkout.payment_status !== "paid") return false;

    const customerId =
      typeof checkout.customer === "string"
        ? checkout.customer
        : (checkout.customer?.id ?? null);
    const subscriptionId =
      typeof checkout.subscription === "string"
        ? checkout.subscription
        : (checkout.subscription?.id ?? null);

    const data: Record<string, unknown> = {
      plan: "pro",
      stripeSubscriptionStatus: "active",
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (customerId) data.stripeCustomerId = customerId;
    if (subscriptionId) data.stripeSubscriptionId = subscriptionId;

    await getAdminDb().collection("users").doc(uid).set(data, { merge: true });
    return true;
  } catch (err) {
    console.error("[settings] checkout sync failed", err);
    return false;
  }
}

function PlanPanel({
  plan,
  leadUsed,
  leadLimit,
  bookingUsed,
  bookingLimit,
}: {
  plan: "free" | "pro" | "studio";
  leadUsed: number;
  leadLimit: number | null;
  bookingUsed: number;
  bookingLimit: number | null;
}) {
  const isFree = plan === "free";
  const planLabel =
    plan === "pro" ? "Pro" : plan === "studio" ? "Studio" : "Free";

  return (
    <Panel title="Plan">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/5 pb-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Plan actual
          </div>
          <div className="font-display text-2xl text-ink">{planLabel}</div>
          {!isFree && (
            <div className="text-xs text-ink/60">7 €/mes · sin restricciones</div>
          )}
        </div>
        {isFree ? (
          <UpgradeProButton />
        ) : (
          <ManageSubscriptionButton />
        )}
      </div>

      {/*
        Usage counters are only meaningful on Free; Pro/Studio simply
        show "ilimitado" so the comparison reads symmetrical.
      */}
      <div className="grid gap-3 sm:grid-cols-2">
        <UsageCard
          label="Solicitudes de presupuesto"
          used={leadUsed}
          limit={leadLimit}
          hint="Se reinicia el 1 de cada mes (UTC)."
        />
        <UsageCard
          label="Reuniones agendadas"
          used={bookingUsed}
          limit={bookingLimit}
          hint="Cuenta solo las reservas no canceladas."
        />
      </div>

      <PlanComparison plan={plan} />
    </Panel>
  );
}

function UsageCard({
  label,
  used,
  limit,
  hint,
}: {
  label: string;
  used: number;
  limit: number | null;
  hint: string;
}) {
  const unlimited = limit === null;
  const ratio = unlimited ? 0 : Math.min(1, used / Math.max(1, limit));
  const tone =
    unlimited
      ? "neutral"
      : ratio >= 1
        ? "danger"
        : ratio >= 0.8
          ? "warn"
          : "neutral";

  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-ink/50">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-2xl text-ink">{used}</span>
        <span className="text-sm text-ink/50">
          / {unlimited ? "∞" : limit} este mes
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/5">
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            tone === "danger"
              ? "bg-danger"
              : tone === "warn"
                ? "bg-mustard"
                : "bg-olive-500",
          )}
          style={{ width: unlimited ? "20%" : `${ratio * 100}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-ink/50">{hint}</div>
    </div>
  );
}

function PlanComparison({ plan }: { plan: "free" | "pro" | "studio" }) {
  const isFree = plan === "free";
  const lines: { label: string; free: string; pro: string }[] = [
    {
      label: "Solicitudes de presupuesto",
      free: "Hasta 10/mes",
      pro: "Ilimitadas",
    },
    {
      label: "Reuniones agendadas",
      free: "Hasta 10/mes",
      pro: "Ilimitadas",
    },
    { label: "Editor + portfolio + presupuestador + agenda", free: "✓", pro: "✓" },
    { label: "Subdominio demee.app/tuhandle", free: "✓", pro: "✓" },
    { label: "Dominio personalizado (tuweb.com)", free: "—", pro: "✓" },
    { label: "Sin marca «Hecho con Demee»", free: "—", pro: "✓" },
    { label: "Múltiples tipos de reunión", free: "—", pro: "✓" },
    { label: "Soporte prioritario", free: "—", pro: "✓" },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-ink/10">
      <div className="grid grid-cols-[1fr_5rem_5rem] bg-ink/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-wide text-ink/60">
        <span>Funcionalidad</span>
        <span className={cn("text-right", isFree && "text-ink")}>Free</span>
        <span className={cn("text-right", !isFree && "text-ink")}>Pro</span>
      </div>
      <ul>
        {lines.map((line) => (
          <li
            key={line.label}
            className="grid grid-cols-[1fr_5rem_5rem] items-center border-t border-ink/5 px-4 py-2.5 text-sm"
          >
            <span className="text-ink/80">{line.label}</span>
            <span
              className={cn(
                "text-right tabular-nums",
                isFree ? "text-ink" : "text-ink/40",
                line.free === "—" && "text-ink/30",
              )}
            >
              {line.free}
            </span>
            <span
              className={cn(
                "text-right tabular-nums",
                !isFree ? "text-ink" : "text-ink/60",
              )}
            >
              {line.pro}
            </span>
          </li>
        ))}
      </ul>
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
