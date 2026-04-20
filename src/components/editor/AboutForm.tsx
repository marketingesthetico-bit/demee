"use client";

import { useMemo } from "react";

import type { EditableProfile } from "@/lib/profile/editable";

import { TextField } from "./TextField";

type About = EditableProfile["about"];

interface Props {
  value: About;
  onChange: (next: About) => void;
}

export function AboutForm({ value, onChange }: Props) {
  const skillsText = useMemo(() => value.skills.join(", "), [value.skills]);

  function onSkillsText(raw: string) {
    const skills = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);
    onChange({ ...value, skills });
  }

  return (
    <div className="space-y-4">
      <TextField
        label="Sobre ti"
        value={value.bio}
        onChange={(v) => onChange({ ...value, bio: v })}
        multiline
        rows={8}
        maxLength={1200}
        hint="2-4 párrafos cortos. Primera persona. Lo concreto convence más que lo genérico."
      />
      <TextField
        label="Habilidades / servicios clave"
        value={skillsText}
        onChange={onSkillsText}
        hint="Separa por comas. Máx. 12."
      />
    </div>
  );
}
