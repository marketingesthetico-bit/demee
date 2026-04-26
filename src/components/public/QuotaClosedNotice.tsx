/**
 * Replaces the public budget / booking form when the owner is over
 * their monthly Free-tier quota. The visitor sees a calm "closed for
 * now" message instead of a form that would fail on submit — and the
 * owner sees that same fact reflected in their dashboard.
 *
 * Server-renderable (no JS), styled with the aesthetic tokens already
 * provided by the surrounding ThemeProvider.
 */
interface Props {
  /** "leads" → received budget requests · "bookings" → meetings booked */
  kind: "leads" | "bookings";
  /** Human-readable owner display name for the message. */
  ownerName: string;
  /** Optional: 1st-of-next-month Date used to format the reset hint. */
  resetsAt?: Date;
}

const COPY: Record<
  Props["kind"],
  { title: string; body: (name: string) => string }
> = {
  leads: {
    title: "Solicitudes pausadas este mes",
    body: (name) =>
      `${name} ha alcanzado el límite de solicitudes de presupuesto que recibe este mes. Puedes contactarle directamente desde su perfil — abrirá el formulario de nuevo el mes que viene.`,
  },
  bookings: {
    title: "Agenda cerrada este mes",
    body: (name) =>
      `${name} ha completado las reuniones que acepta este mes. Puedes contactarle directamente desde su perfil — la agenda se reabre el mes que viene.`,
  },
};

function formatReset(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(d);
}

export function QuotaClosedNotice({ kind, ownerName, resetsAt }: Props) {
  const { title, body } = COPY[kind];
  return (
    <div className="space-y-3 rounded-aesthetic-base border border-aesthetic-fg/15 bg-aesthetic-bg p-6">
      <h2 className="font-aesthetic-display text-2xl">{title}</h2>
      <p className="text-aesthetic-fg/80">{body(ownerName)}</p>
      {resetsAt && (
        <p className="text-sm text-aesthetic-muted">
          Se reabre el {formatReset(resetsAt)}.
        </p>
      )}
    </div>
  );
}
