import { describe, expect, it } from "vitest";

import {
  extractedProfileSchema,
  normalizeExtractedProfile,
} from "./extract-profile-schema";

describe("extractedProfileSchema", () => {
  it("accepts a fully populated LLM response", () => {
    const result = extractedProfileSchema.parse({
      header: { name: "María García", headline: "Diseño de marca", location: "Madrid" },
      about: { bio: "Trabajo con startups.", skills: ["Branding", "Logo"] },
      services: [{ name: "Identidad de marca", description: "2-3 semanas." }],
      portfolio: [{ title: "Proyecto X", description: "…", link: "https://x.com", year: "2024" }],
      social: {
        linkedin: "https://linkedin.com/in/maria",
        twitter: null,
        instagram: null,
        github: null,
        behance: null,
        dribbble: null,
        website: null,
      },
    });
    expect(result.header.name).toBe("María García");
    expect(result.about.skills).toHaveLength(2);
    expect(result.services).toHaveLength(1);
  });

  it("fills defaults when the LLM omits optional sections", () => {
    const result = extractedProfileSchema.parse({
      header: { name: "Erik", headline: null, location: null },
      about: { bio: null, skills: [] },
    });
    expect(result.services).toEqual([]);
    expect(result.portfolio).toEqual([]);
    expect(result.social).toEqual({});
  });

  it("fills empty defaults for totally empty payloads (LLM leniency)", () => {
    const result = extractedProfileSchema.parse({});
    expect(result.header).toEqual({});
    expect(result.about).toEqual({ skills: [] });
    expect(result.services).toEqual([]);
    expect(result.portfolio).toEqual([]);
    expect(result.social).toEqual({});
  });

  it("rejects payloads with the wrong type on a required nested field", () => {
    const parse = extractedProfileSchema.safeParse({
      header: { name: 42 },
      about: { skills: ["ok"] },
    });
    expect(parse.success).toBe(false);
  });
});

describe("normalizeExtractedProfile", () => {
  it("strips nullish values and truncates arrays", () => {
    const parsed = extractedProfileSchema.parse({
      header: { name: "Julia", headline: "   ", location: null },
      about: {
        bio: "   hola   ",
        skills: ["", "Branding", " copywriting ", "a".repeat(100)],
      },
      services: [
        { name: "Servicio 1", description: "Desc" },
        { name: " ", description: "No debería aparecer" },
      ],
    });
    const normalized = normalizeExtractedProfile(parsed);
    expect(normalized.headline).toBeUndefined();
    expect(normalized.bio).toBe("hola");
    expect(normalized.skills).toEqual(["Branding", "copywriting"]);
    expect(normalized.services).toHaveLength(1);
    expect(normalized.services?.[0]?.name).toBe("Servicio 1");
    expect(normalized.social).toBeUndefined();
  });

  it("keeps social only when at least one link is present", () => {
    const parsed = extractedProfileSchema.parse({
      header: { name: "Julia", headline: null, location: null },
      about: { bio: null, skills: [] },
      social: {
        linkedin: null,
        twitter: null,
        instagram: null,
        github: "https://github.com/julia",
        behance: null,
        dribbble: null,
        website: null,
      },
    });
    const normalized = normalizeExtractedProfile(parsed);
    expect(normalized.social).toBeDefined();
    expect(normalized.social?.github).toBe("https://github.com/julia");
    expect(normalized.social?.linkedin).toBeUndefined();
  });

  it("caps portfolio to 6 items", () => {
    const parsed = extractedProfileSchema.parse({
      header: { name: "Julia", headline: null, location: null },
      about: { bio: null, skills: [] },
      portfolio: Array.from({ length: 10 }, (_, i) => ({
        title: `Proyecto ${i}`,
        description: "…",
        link: null,
        year: null,
      })),
    });
    const normalized = normalizeExtractedProfile(parsed);
    expect(normalized.portfolio).toHaveLength(6);
  });
});
