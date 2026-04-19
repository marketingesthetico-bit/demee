export default function LandingPage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-8 py-16 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-olive/20 bg-olive/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-olive-600">
        <span className="h-1.5 w-1.5 rounded-full bg-mustard" />
        En construcción
      </span>
      <h1 className="max-w-3xl font-display text-5xl leading-tight text-ink sm:text-6xl">
        Tu mini-web de freelance, lista en 5 minutos.
      </h1>
      <p className="max-w-xl text-lg text-ink/70">
        Portfolio, presupuestos y agenda en una sola URL personal.
      </p>
    </main>
  );
}
