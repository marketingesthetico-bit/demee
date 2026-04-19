export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  "about",
  "account",
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "book",
  "brand",
  "budget",
  "careers",
  "contact",
  "content",
  "dashboard",
  "demee",
  "dev",
  "docs",
  "download",
  "edit",
  "editor",
  "email",
  "enterprise",
  "faq",
  "features",
  "for",
  "forgot-password",
  "help",
  "hello",
  "home",
  "industry",
  "jobs",
  "legal",
  "login",
  "logout",
  "mail",
  "media",
  "onboarding",
  "page",
  "password",
  "payment",
  "pricing",
  "privacy",
  "profile",
  "public",
  "pub",
  "register",
  "reset",
  "reset-password",
  "root",
  "search",
  "settings",
  "share",
  "sign-in",
  "sign-up",
  "signin",
  "signup",
  "sitemap",
  "static",
  "status",
  "studio",
  "subscribe",
  "support",
  "system",
  "team",
  "terms",
  "test",
  "upgrade",
  "user",
  "users",
  "verify",
  "welcome",
  "www",
]);

export const HANDLE_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export interface HandleValidationResult {
  valid: boolean;
  reason?:
    | "too-short"
    | "too-long"
    | "invalid-chars"
    | "starts-or-ends-with-hyphen"
    | "reserved";
}

export function validateHandleFormat(raw: string): HandleValidationResult {
  const handle = raw.trim().toLowerCase();
  if (handle.length < 3) return { valid: false, reason: "too-short" };
  if (handle.length > 30) return { valid: false, reason: "too-long" };
  if (handle.startsWith("-") || handle.endsWith("-")) {
    return { valid: false, reason: "starts-or-ends-with-hyphen" };
  }
  if (!HANDLE_REGEX.test(handle)) return { valid: false, reason: "invalid-chars" };
  if (RESERVED_HANDLES.has(handle)) return { valid: false, reason: "reserved" };
  return { valid: true };
}
