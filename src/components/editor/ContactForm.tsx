"use client";

import type { EditableProfile } from "@/lib/profile/editable";
import type { PublicSocial } from "@/lib/profile/public";

import { TextField } from "./TextField";

type Contact = EditableProfile["contact"];

const SOCIAL_FIELDS: { key: keyof PublicSocial; label: string; placeholder: string }[] = [
  { key: "website", label: "Web personal", placeholder: "https://tusitio.com" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/…" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/…" },
  { key: "twitter", label: "X / Twitter", placeholder: "https://twitter.com/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "behance", label: "Behance", placeholder: "https://behance.net/…" },
  { key: "dribbble", label: "Dribbble", placeholder: "https://dribbble.com/…" },
];

interface Props {
  value: Contact;
  onChange: (next: Contact) => void;
}

export function ContactForm({ value, onChange }: Props) {
  function patch(changes: Partial<Contact>) {
    onChange({ ...value, ...changes });
  }

  function patchSocial(key: keyof PublicSocial, v: string) {
    const trimmed = v.trim();
    patch({
      social: { ...value.social, [key]: trimmed === "" ? null : trimmed },
    });
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Email de contacto"
        value={value.email ?? ""}
        onChange={(v) => patch({ email: v.trim() === "" ? null : v })}
        type="email"
        placeholder="tu@email.com"
        maxLength={200}
      />
      <TextField
        label="Teléfono"
        value={value.phone ?? ""}
        onChange={(v) => patch({ phone: v.trim() === "" ? null : v })}
        type="tel"
        placeholder="+34 ..."
        maxLength={40}
      />

      <div className="space-y-3">
        <h4 className="text-xs font-medium uppercase tracking-wide text-ink/50">Redes</h4>
        <div className="space-y-3">
          {SOCIAL_FIELDS.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              value={value.social[field.key] ?? ""}
              onChange={(v) => patchSocial(field.key, v)}
              type="url"
              placeholder={field.placeholder}
              maxLength={200}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
