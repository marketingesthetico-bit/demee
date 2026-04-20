import Link from "next/link";

import { getServerSession } from "@/lib/firebase/session";
import { loadOwnProfile } from "@/lib/firebase/user-profile";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await getServerSession();
  const loaded = session ? await loadOwnProfile(session.uid) : null;

  const firstName = loaded?.profile.header.name?.split(" ")[0] ?? "freelancer";

  return (
    <div className="container max-w-4xl space-y-10 py-12">
      <header className="space-y-2">
        <p className="text-sm text-ink/50">Bienvenido de nuevo,</p>
        <h1 className="font-display text-4xl text-ink">Hola, {firstName}.</h1>
      </header>

      <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-ink">Mi página pública</h2>
            {loaded?.handle ? (
              <p className="text-sm text-ink/70">
                Vive en{" "}
                <a
                  href={`/${loaded.handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-olive-700 hover:underline"
                >
                  demee.app/{loaded.handle}
                </a>
              </p>
            ) : (
              <p className="text-sm text-ink/70">Termina el onboarding para publicarla.</p>
            )}
          </div>
          <Link
            href="/edit"
            className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-ink/90"
          >
            Editar mi página
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <SoonCard
          icon="💰"
          title="Presupuestos"
          subtitle="Deja que el visitante configure y te envíe un presupuesto al momento."
        />
        <SoonCard
          icon="📅"
          title="Agenda"
          subtitle="Conecta Google Calendar y acepta llamadas sin ping-pong de emails."
        />
      </section>
    </div>
  );
}

function SoonCard({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white/60 p-5">
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-ink">{title}</h3>
          <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/60">
            Soon
          </span>
        </div>
        <p className="text-sm text-ink/60">{subtitle}</p>
      </div>
    </div>
  );
}
