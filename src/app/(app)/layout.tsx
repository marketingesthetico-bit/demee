import { redirect } from "next/navigation";

import { MobileNav } from "@/components/dashboard/MobileNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getAdminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userSnap = await getAdminDb().collection("users").doc(session.uid).get();
  const handle = userSnap.exists ? (userSnap.data()?.handle as string | undefined) ?? null : null;

  // Users still in onboarding (no handle yet) get a minimal shell —
  // the onboarding layout owns its own stepper.
  if (!handle) {
    return <div className="min-h-screen bg-paper">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar handle={handle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-ink/10 bg-white/60 px-3 lg:hidden">
          <div className="flex items-center gap-3">
            <MobileNav handle={handle} />
            <a href="/dashboard" className="font-display text-lg text-ink">
              demee<span className="text-mustard">.</span>
            </a>
          </div>
          <a
            href={`/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-olive-700"
          >
            Ver mi página ↗
          </a>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
