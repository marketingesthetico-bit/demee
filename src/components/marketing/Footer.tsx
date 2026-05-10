import Link from "next/link";

/**
 * Marketing footer. Server-renderable (no JS) — three columns of
 * links plus a bottom row with the wordmark and a small legal note.
 */
export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="container grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link
            href="/"
            className="inline-block font-display text-2xl text-ink"
          >
            demee<span className="text-mustard">.</span>
          </Link>
          <p className="mt-3 max-w-[18rem] text-sm text-ink/65">
            Tu mini-web de freelance en una sola URL.
          </p>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-ink/50">
            Producto
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="/#funcionalidades"
                className="text-ink/75 hover:text-ink"
              >
                Funcionalidades
              </a>
            </li>
            <li>
              <a href="/#precio" className="text-ink/75 hover:text-ink">
                Precio
              </a>
            </li>
            <li>
              <a href="/#faq" className="text-ink/75 hover:text-ink">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-ink/50">
            Cuenta
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/sign-in" className="text-ink/75 hover:text-ink">
                Entrar
              </Link>
            </li>
            <li>
              <Link href="/sign-up" className="text-ink/75 hover:text-ink">
                Crear cuenta
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-ink/50">
            Contacto
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="mailto:hola@demee.app"
                className="text-ink/75 hover:text-ink"
              >
                hola@demee.app
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink/55 sm:flex-row">
          <span>© {new Date().getFullYear()} Demee · Hecho en España</span>
          <div className="flex items-center gap-4">
            <a href="/legal/privacy" className="hover:text-ink">
              Privacidad
            </a>
            <a href="/legal/terms" className="hover:text-ink">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
