"use client";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "email" | "url" | "tel";
  id?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  maxLength,
  multiline = false,
  rows = 4,
  type = "text",
  id,
}: Props) {
  const common =
    "w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20";
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-ink">{label}</span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={common}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={common}
        />
      )}
      {hint && <span className="text-xs text-ink/50">{hint}</span>}
    </label>
  );
}
