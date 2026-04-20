import "server-only";

import type { NormalizedImportedProfile } from "@/lib/ai/extract-profile-schema";

import { FETCH_TIMEOUT_MS, ScrapeError } from "./fetch-html";

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  avatar_url: string | null;
  public_repos: number;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
}

const GITHUB_HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "User-Agent": "DemeeImporter/1.0",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function githubFetch<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: GITHUB_HEADERS, signal: controller.signal });
    if (res.status === 404) throw new ScrapeError("not-found", `GitHub ${url}`);
    if (res.status === 403 || res.status === 429) {
      throw new ScrapeError("bot-blocked", `GitHub rate-limited (${res.status})`);
    }
    if (!res.ok) throw new ScrapeError("fetch-failed", `GitHub ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ScrapeError) throw err;
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    throw new ScrapeError(isAbort ? "timeout" : "fetch-failed", (err as Error).message);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchGitHubProfile(username: string): Promise<NormalizedImportedProfile> {
  const user = await githubFetch<GitHubUser>(
    `https://api.github.com/users/${encodeURIComponent(username)}`,
  );
  const repos = await githubFetch<GitHubRepo[]>(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated`,
  );

  const topRepos = repos
    .filter((r) => !r.fork && !r.archived && (r.description || r.stargazers_count > 0))
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  const portfolio = topRepos.map((r) => ({
    title: r.name,
    description:
      (r.description?.trim() ?? "") +
      (r.language ? ` · ${r.language}` : "") +
      (r.stargazers_count > 0 ? ` · ★ ${r.stargazers_count}` : ""),
    link: r.html_url,
  }));

  const skills = Array.from(
    new Set(
      topRepos
        .map((r) => r.language)
        .filter((l): l is string => Boolean(l)),
    ),
  ).slice(0, 10);

  const website =
    user.blog && user.blog.trim().length > 0
      ? user.blog.startsWith("http")
        ? user.blog
        : `https://${user.blog}`
      : undefined;

  const bioParts: string[] = [];
  if (user.bio) bioParts.push(user.bio.trim());
  if (user.company) bioParts.push(`Trabajo en ${user.company}.`);
  if (user.public_repos > 5) {
    bioParts.push(`Mantengo ${user.public_repos} repositorios públicos en GitHub.`);
  }

  return {
    headline: user.bio?.trim() || (user.name ? `Developer · ${user.name}` : undefined),
    bio: bioParts.length > 0 ? bioParts.join(" ") : undefined,
    skills: skills.length > 0 ? skills : undefined,
    portfolio: portfolio.length > 0 ? portfolio : undefined,
    social: {
      github: `https://github.com/${user.login}`,
      twitter: user.twitter_username ? `https://twitter.com/${user.twitter_username}` : undefined,
      website,
    },
  };
}

export interface GitHubProfileSummary {
  name: string | null;
  location: string | null;
  avatarURL: string | null;
}

export async function fetchGitHubProfileSummary(
  username: string,
): Promise<GitHubProfileSummary> {
  const user = await githubFetch<GitHubUser>(
    `https://api.github.com/users/${encodeURIComponent(username)}`,
  );
  return { name: user.name, location: user.location, avatarURL: user.avatar_url };
}
