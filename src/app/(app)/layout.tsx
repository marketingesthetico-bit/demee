import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/firebase/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white/60 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <a href="/dashboard" className="font-display text-lg text-ink">
            demee<span className="text-mustard">.</span>
          </a>
          <a
            href="/api/auth/logout"
            className="text-sm text-ink/60 hover:text-ink"
            aria-label="Cerrar sesión"
          >
            Salir
          </a>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
