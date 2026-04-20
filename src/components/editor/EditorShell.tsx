"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PublicPageBody } from "@/components/public/PublicPageBody";
import { ThemeProvider } from "@/components/public/ThemeProvider";
import type { SupportedAesthetic } from "@/lib/aesthetics";
import type { BookingConfig } from "@/lib/booking/types";
import type { BudgetConfig } from "@/lib/budget/types";
import type { ProfileSectionKey } from "@/lib/industries";
import type { EditableProfile } from "@/lib/profile/editable";
import type {
  PublicGalleryImage,
  PublicPortfolioItem,
  PublicProfile,
  PublicService,
} from "@/lib/profile/public";
import { cn } from "@/lib/utils";

import { AboutForm } from "./AboutForm";
import { AestheticPicker } from "./AestheticPicker";
import { BookingForm } from "./BookingForm";
import { BudgetForm } from "./BudgetForm";
import { ContactForm } from "./ContactForm";
import { HeaderForm } from "./HeaderForm";
import { ImagesForm } from "./ImagesForm";
import { PortfolioForm } from "./PortfolioForm";
import { SectionCard } from "./SectionCard";
import { SectionsToggle } from "./SectionsToggle";
import { ServicesForm } from "./ServicesForm";

type SaveStatus =
  | { kind: "clean" }
  | { kind: "dirty" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string };

const SAVE_DEBOUNCE_MS = 800;

interface Props {
  initialProfile: EditableProfile;
  initialBudget: BudgetConfig;
  initialBooking: BookingConfig;
  handle: string;
}

/**
 * Converts the editable profile into the shape PublicPageBody consumes.
 * Pure projection — no effects.
 */
function toPublicPreview(
  profile: EditableProfile,
  handle: string,
  hasBudget: boolean,
  hasBooking: boolean,
): PublicProfile {
  return {
    uid: "preview",
    handle,
    hasBudget,
    hasBooking,
    industry: profile.industry,
    aesthetic: profile.aesthetic,
    defaultSections: profile.defaultSections,
    header: {
      name: profile.header.name,
      headline: profile.header.headline,
      location: profile.header.location,
      availability: profile.header.availability,
      photoURL: profile.header.photoURL,
    },
    about: profile.about,
    services: profile.services,
    portfolio: profile.portfolio,
    gallery: profile.gallery,
    contact: profile.contact,
  };
}

type ProfilePatch = Partial<{
  aesthetic: SupportedAesthetic;
  defaultSections: ProfileSectionKey[];
  header: EditableProfile["header"];
  about: EditableProfile["about"];
  services: PublicService[];
  portfolio: PublicPortfolioItem[];
  gallery: PublicGalleryImage[];
  contact: EditableProfile["contact"];
}>;

export function EditorShell({
  initialProfile,
  initialBudget,
  initialBooking,
  handle,
}: Props) {
  const [profile, setProfile] = useState<EditableProfile>(initialProfile);
  const [budget, setBudget] = useState<BudgetConfig>(initialBudget);
  const [booking, setBooking] = useState<BookingConfig>(initialBooking);
  const [status, setStatus] = useState<SaveStatus>({ kind: "clean" });
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const pendingPatch = useRef<ProfilePatch>({});
  const pendingBudget = useRef<BudgetConfig | null>(null);
  const pendingBooking = useRef<BookingConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const budgetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSave = useCallback(async () => {
    const patch = pendingPatch.current;
    if (Object.keys(patch).length === 0) {
      setStatus({ kind: "clean" });
      return;
    }
    pendingPatch.current = {};
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({ error: "server-error" }))) as {
          error?: string;
        };
        setStatus({
          kind: "error",
          message: body.error === "invalid-body" ? "Algún campo no es válido." : "No se pudo guardar.",
        });
        return;
      }
      setStatus({ kind: "saved", at: Date.now() });
    } catch (err) {
      console.error("[editor] save failed", err);
      setStatus({ kind: "error", message: "Error de red." });
    }
  }, []);

  const scheduleSave = useCallback(
    (patch: ProfilePatch) => {
      pendingPatch.current = { ...pendingPatch.current, ...patch };
      setStatus({ kind: "dirty" });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
    },
    [flushSave],
  );

  const flushBudgetSave = useCallback(async () => {
    const next = pendingBudget.current;
    if (!next) {
      setStatus({ kind: "clean" });
      return;
    }
    pendingBudget.current = null;
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/budget", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setStatus({ kind: "error", message: "No se pudo guardar el presupuesto." });
        return;
      }
      setStatus({ kind: "saved", at: Date.now() });
    } catch (err) {
      console.error("[editor/budget] save failed", err);
      setStatus({ kind: "error", message: "Error de red." });
    }
  }, []);

  function updateBudget(next: BudgetConfig) {
    setBudget(next);
    pendingBudget.current = next;
    setStatus({ kind: "dirty" });
    if (budgetTimerRef.current) clearTimeout(budgetTimerRef.current);
    budgetTimerRef.current = setTimeout(flushBudgetSave, SAVE_DEBOUNCE_MS);
  }

  const flushBookingSave = useCallback(async () => {
    const next = pendingBooking.current;
    if (!next) {
      setStatus({ kind: "clean" });
      return;
    }
    pendingBooking.current = null;
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setStatus({ kind: "error", message: "No se pudo guardar la agenda." });
        return;
      }
      setStatus({ kind: "saved", at: Date.now() });
    } catch (err) {
      console.error("[editor/booking] save failed", err);
      setStatus({ kind: "error", message: "Error de red." });
    }
  }, []);

  function updateBooking(next: BookingConfig) {
    setBooking(next);
    pendingBooking.current = next;
    setStatus({ kind: "dirty" });
    if (bookingTimerRef.current) clearTimeout(bookingTimerRef.current);
    bookingTimerRef.current = setTimeout(flushBookingSave, SAVE_DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (budgetTimerRef.current) clearTimeout(budgetTimerRef.current);
      if (bookingTimerRef.current) clearTimeout(bookingTimerRef.current);
    };
  }, []);

  function updateHeader(next: EditableProfile["header"]) {
    setProfile((prev) => ({ ...prev, header: next }));
    scheduleSave({ header: next });
  }

  function updateAbout(next: EditableProfile["about"]) {
    setProfile((prev) => ({ ...prev, about: next }));
    scheduleSave({ about: next });
  }

  function updateAesthetic(next: SupportedAesthetic) {
    setProfile((prev) => ({ ...prev, aesthetic: next }));
    scheduleSave({ aesthetic: next });
  }

  function updateServices(next: PublicService[]) {
    setProfile((prev) => ({ ...prev, services: next }));
    scheduleSave({ services: next });
  }

  function updatePortfolio(next: PublicPortfolioItem[]) {
    setProfile((prev) => ({ ...prev, portfolio: next }));
    scheduleSave({ portfolio: next });
  }

  function updateGallery(next: PublicGalleryImage[]) {
    setProfile((prev) => ({ ...prev, gallery: next }));
    scheduleSave({ gallery: next });
  }

  function updateContact(next: EditableProfile["contact"]) {
    setProfile((prev) => ({ ...prev, contact: next }));
    scheduleSave({ contact: next });
  }

  function updateDefaultSections(next: ProfileSectionKey[]) {
    setProfile((prev) => ({ ...prev, defaultSections: next }));
    scheduleSave({ defaultSections: next });
  }

  const preview = toPublicPreview(
    profile,
    handle,
    budget.enabled && budget.items.length > 0,
    booking.enabled,
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1400px] flex-col lg:flex-row">
      <div
        className="sticky top-0 z-20 flex items-center gap-2 border-b border-ink/10 bg-white/80 p-2 backdrop-blur lg:hidden"
        role="tablist"
      >
        <MobileTab
          active={mobileTab === "edit"}
          onClick={() => setMobileTab("edit")}
        >
          Editar
        </MobileTab>
        <MobileTab
          active={mobileTab === "preview"}
          onClick={() => setMobileTab("preview")}
        >
          Vista previa
        </MobileTab>
      </div>

      <section
        className={cn(
          "w-full space-y-4 p-6 lg:w-[480px] lg:shrink-0 lg:overflow-y-auto",
          mobileTab === "preview" ? "hidden lg:block" : "",
        )}
      >
        <EditorHeader status={status} handle={handle} />

        <SectionCard
          title="Presentación"
          subtitle="Nombre, titular, ubicación, disponibilidad."
        >
          <HeaderForm value={profile.header} onChange={updateHeader} />
        </SectionCard>

        <SectionCard title="Sobre mí" subtitle="Bio y habilidades/servicios.">
          <AboutForm value={profile.about} onChange={updateAbout} />
        </SectionCard>

        <SectionCard title="Imágenes" subtitle="Foto de perfil y galería de trabajo.">
          <ImagesForm
            header={profile.header}
            gallery={profile.gallery}
            onHeaderChange={updateHeader}
            onGalleryChange={updateGallery}
          />
        </SectionCard>

        <SectionCard title="Servicios" subtitle="Lo que ofreces, con precio opcional.">
          <ServicesForm value={profile.services} onChange={updateServices} />
        </SectionCard>

        <SectionCard title="Portfolio" subtitle="Proyectos con título, descripción y enlace.">
          <PortfolioForm value={profile.portfolio} onChange={updatePortfolio} />
        </SectionCard>

        <SectionCard title="Contacto" subtitle="Email, teléfono y redes sociales.">
          <ContactForm value={profile.contact} onChange={updateContact} />
        </SectionCard>

        <SectionCard
          title="Presupuestador"
          subtitle="Vive en demee.app/tuhandle/budget cuando está activo."
          defaultOpen={false}
        >
          <BudgetForm value={budget} onChange={updateBudget} />
        </SectionCard>

        <SectionCard
          title="Agenda"
          subtitle="Reserva de llamadas en demee.app/tuhandle/book cuando está activa."
          defaultOpen={false}
        >
          <BookingForm value={booking} onChange={updateBooking} />
        </SectionCard>

        <SectionCard
          title="Estilo visual"
          subtitle="Cambia el tema de tu página pública."
        >
          <AestheticPicker value={profile.aesthetic} onChange={updateAesthetic} />
        </SectionCard>

        <SectionCard
          title="Secciones visibles"
          subtitle="Elige qué mostrar en tu página pública."
          defaultOpen={false}
        >
          <SectionsToggle
            value={profile.defaultSections}
            onChange={updateDefaultSections}
          />
        </SectionCard>
      </section>

      <section
        className={cn(
          "flex-1 border-t border-ink/10 lg:border-l lg:border-t-0",
          mobileTab === "edit" ? "hidden lg:block" : "",
        )}
      >
        <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-ink/10 bg-white/80 px-5 text-xs text-ink/60 backdrop-blur">
          <span className="font-mono">demee.app/{handle}</span>
          <span>Vista previa en vivo</span>
        </div>
        <ThemeProvider
          aesthetic={profile.aesthetic}
          className="bg-aesthetic-bg font-aesthetic-body text-aesthetic-fg"
        >
          <div className="mx-auto max-w-2xl px-6 py-10 text-sm sm:px-8">
            <PublicPageBody profile={preview} />
          </div>
        </ThemeProvider>
      </section>
    </div>
  );
}

function MobileTab({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-3 py-2 text-sm font-medium transition",
        active ? "bg-ink text-paper" : "text-ink/60 hover:bg-ink/5",
      )}
    >
      {children}
    </button>
  );
}

function EditorHeader({ status, handle }: { status: SaveStatus; handle: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 pb-2">
      <div>
        <h1 className="font-display text-2xl text-ink">Mi página</h1>
        <p className="text-xs text-ink/60">
          Se guarda automáticamente mientras escribes · publicada en{" "}
          <a
            href={`/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-olive-700 hover:underline"
          >
            demee.app/{handle}
          </a>
        </p>
      </div>
      <StatusPill status={status} />
    </header>
  );
}

function StatusPill({ status }: { status: SaveStatus }) {
  const base = "rounded-full px-2.5 py-1 text-xs font-medium";
  if (status.kind === "clean") {
    return <span className={cn(base, "bg-ink/5 text-ink/50")}>Al día</span>;
  }
  if (status.kind === "dirty") {
    return <span className={cn(base, "bg-mustard/20 text-mustard-600")}>Sin guardar</span>;
  }
  if (status.kind === "saving") {
    return <span className={cn(base, "bg-olive-100 text-olive-700")}>Guardando…</span>;
  }
  if (status.kind === "saved") {
    return <span className={cn(base, "bg-success/10 text-success")}>Guardado</span>;
  }
  return <span className={cn(base, "bg-danger/10 text-danger")}>{status.message}</span>;
}
