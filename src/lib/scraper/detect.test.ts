import { describe, expect, it } from "vitest";

import { detectScrapeSource } from "./detect";

describe("detectScrapeSource", () => {
  it("detects LinkedIn URLs", () => {
    const res = detectScrapeSource("https://www.linkedin.com/in/erik");
    expect(res.kind).toBe("linkedin");
  });

  it("detects GitHub usernames", () => {
    const res = detectScrapeSource("https://github.com/marketingesthetico-bit");
    expect(res).toEqual({
      kind: "github",
      username: "marketingesthetico-bit",
      url: "https://github.com/marketingesthetico-bit",
    });
  });

  it("treats github.com/org/repo as web (repo is not a user profile)", () => {
    const res = detectScrapeSource("https://github.com/vercel/next.js");
    expect(res.kind).toBe("github");
    if (res.kind === "github") {
      expect(res.username).toBe("vercel");
    }
  });

  it("treats arbitrary domains as web", () => {
    const res = detectScrapeSource("https://erikdesign.com/about");
    expect(res.kind).toBe("web");
  });

  it("blocks private IPs and localhost", () => {
    expect(detectScrapeSource("http://localhost:3000").kind).toBe("blocked-host");
    expect(detectScrapeSource("http://127.0.0.1").kind).toBe("blocked-host");
    expect(detectScrapeSource("http://10.0.0.1").kind).toBe("blocked-host");
    expect(detectScrapeSource("http://172.20.0.1").kind).toBe("blocked-host");
    expect(detectScrapeSource("http://192.168.1.1").kind).toBe("blocked-host");
  });

  it("blocks non-http protocols", () => {
    expect(detectScrapeSource("file:///etc/passwd").kind).toBe("blocked-host");
    expect(detectScrapeSource("ftp://example.com").kind).toBe("blocked-host");
  });

  it("rejects invalid URLs", () => {
    expect(detectScrapeSource("not a url").kind).toBe("invalid-url");
    expect(detectScrapeSource("").kind).toBe("invalid-url");
  });

  it("allows 172.15 and 172.32 (outside private block)", () => {
    expect(detectScrapeSource("http://172.15.0.1").kind).toBe("web");
    expect(detectScrapeSource("http://172.32.0.1").kind).toBe("web");
  });
});
