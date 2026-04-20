import { describe, expect, it } from "vitest";

import type { NormalizedImportedProfile } from "./extract-profile-schema";
import type { PolishedProfile } from "./polish-profile-schema";
import { mergePolishedIntoProfile } from "./polish-profile-schema";

function original(overrides: Partial<NormalizedImportedProfile> = {}): NormalizedImportedProfile {
  return {
    headline: "Raw headline",
    bio: "Raw bio",
    skills: ["branding", "logos"],
    services: [
      { name: "Identity", description: "raw identity desc" },
      { name: "Web", description: "raw web desc" },
    ],
    portfolio: [{ title: "Keep me", description: "raw" }],
    social: { website: "https://example.com" },
    ...overrides,
  };
}

function polished(overrides: Partial<PolishedProfile> = {}): PolishedProfile {
  return {
    header: { headline: "Polished headline" },
    about: { bio: "Polished bio", skills: ["branding", "logos"] },
    services: [
      { name: "Identity", description: "outcome-focused identity copy" },
      { name: "Web", description: "outcome-focused web copy" },
    ],
    ...overrides,
  };
}

describe("mergePolishedIntoProfile", () => {
  it("replaces headline, bio and service descriptions from polish", () => {
    const merged = mergePolishedIntoProfile(original(), polished());
    expect(merged.headline).toBe("Polished headline");
    expect(merged.bio).toBe("Polished bio");
    expect(merged.services?.[0]?.description).toBe("outcome-focused identity copy");
    expect(merged.services?.[1]?.description).toBe("outcome-focused web copy");
  });

  it("preserves portfolio and social untouched (polish never sees them)", () => {
    const merged = mergePolishedIntoProfile(original(), polished());
    expect(merged.portfolio).toEqual([{ title: "Keep me", description: "raw" }]);
    expect(merged.social?.website).toBe("https://example.com");
  });

  it("falls back to original when polish returns empty strings", () => {
    const merged = mergePolishedIntoProfile(
      original(),
      polished({ header: { headline: "" }, about: { bio: "   ", skills: [] } }),
    );
    expect(merged.headline).toBe("Raw headline");
    expect(merged.bio).toBe("Raw bio");
    expect(merged.skills).toEqual(["branding", "logos"]);
  });

  it("keeps service description if polish omits a service (not in polished services list)", () => {
    const merged = mergePolishedIntoProfile(
      original(),
      polished({
        services: [{ name: "Identity", description: "outcome-focused" }],
      }),
    );
    expect(merged.services?.[0]?.description).toBe("outcome-focused");
    expect(merged.services?.[1]?.description).toBe("raw web desc");
  });

  it("matches service names case-insensitively", () => {
    const merged = mergePolishedIntoProfile(
      original(),
      polished({
        services: [{ name: "IDENTITY", description: "polished" }],
      }),
    );
    expect(merged.services?.[0]?.description).toBe("polished");
  });
});
