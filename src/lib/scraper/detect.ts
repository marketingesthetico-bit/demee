export type ScrapeSource =
  | { kind: "linkedin"; url: string }
  | { kind: "github"; username: string; url: string }
  | { kind: "web"; url: string }
  | { kind: "invalid-url" }
  | { kind: "blocked-host"; reason: "private-ip" | "non-http" };

const PRIVATE_HOST_PREFIXES = [
  "localhost",
  "127.",
  "10.",
  "192.168.",
  "169.254.",
  "::1",
  "0.0.0.0",
];

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (PRIVATE_HOST_PREFIXES.some((p) => lower === p || lower.startsWith(p))) {
    return true;
  }
  // 172.16.0.0 — 172.31.255.255
  const match = lower.match(/^172\.(\d+)\./);
  if (match) {
    const octet = Number(match[1]);
    if (octet >= 16 && octet <= 31) return true;
  }
  return false;
}

export function detectScrapeSource(rawUrl: string): ScrapeSource {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { kind: "invalid-url" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { kind: "blocked-host", reason: "non-http" };
  }
  if (isBlockedHost(url.hostname)) {
    return { kind: "blocked-host", reason: "private-ip" };
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "linkedin.com" || host.endsWith(".linkedin.com")) {
    return { kind: "linkedin", url: url.toString() };
  }

  if (host === "github.com" || host === "gist.github.com") {
    const username = url.pathname.split("/").filter(Boolean)[0];
    if (username && /^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/.test(username)) {
      return { kind: "github", username, url: url.toString() };
    }
    return { kind: "web", url: url.toString() };
  }

  return { kind: "web", url: url.toString() };
}
