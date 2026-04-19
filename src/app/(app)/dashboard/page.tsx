import { getServerSession } from "@/lib/firebase/session";

export default async function DashboardPage() {
  const session = await getServerSession();

  return (
    <div className="container max-w-2xl space-y-6 py-16">
      <h1 className="font-display text-4xl text-ink">Bienvenido a Demee</h1>
      <p className="text-ink/70">
        Sesión iniciada como <strong>{session?.email ?? "—"}</strong>.
      </p>
      <p className="text-sm text-ink/60">
        Esta es una página placeholder. El editor, los presupuestos y la agenda llegan en las
        próximas semanas del roadmap.
      </p>
      <a
        href="/onboarding"
        className="inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-ink/90"
      >
        Completar onboarding
      </a>
    </div>
  );
}
