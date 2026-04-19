import { describe, expect, it } from "vitest";

import { HANDLE_REGEX, RESERVED_HANDLES, validateHandleFormat } from "./reserved-handles";

describe("HANDLE_REGEX", () => {
  it.each([
    "erik",
    "a1b",
    "maria-garcia",
    "user123",
    "a".repeat(30),
    "abc",
  ])("accepts %s", (handle) => {
    expect(HANDLE_REGEX.test(handle)).toBe(true);
  });

  it.each([
    ["ab", "less than 3 chars"],
    ["a".repeat(31), "more than 30 chars"],
    ["-erik", "leading hyphen"],
    ["erik-", "trailing hyphen"],
    ["Erik", "uppercase"],
    ["erik.dev", "dot"],
    ["erik_dev", "underscore"],
    ["erik dev", "space"],
    ["", "empty"],
  ])("rejects %s (%s)", (handle) => {
    expect(HANDLE_REGEX.test(handle)).toBe(false);
  });
});

describe("validateHandleFormat", () => {
  it("accepts a plain handle", () => {
    expect(validateHandleFormat("erik")).toEqual({ valid: true });
  });

  it("trims and lowercases before validating", () => {
    expect(validateHandleFormat("  ERIK  ")).toEqual({ valid: true });
  });

  it("reports too-short", () => {
    expect(validateHandleFormat("ab")).toEqual({ valid: false, reason: "too-short" });
  });

  it("reports too-long", () => {
    expect(validateHandleFormat("a".repeat(31))).toEqual({ valid: false, reason: "too-long" });
  });

  it("reports starts-or-ends-with-hyphen for leading hyphen", () => {
    expect(validateHandleFormat("-erik")).toEqual({
      valid: false,
      reason: "starts-or-ends-with-hyphen",
    });
  });

  it("reports starts-or-ends-with-hyphen for trailing hyphen", () => {
    expect(validateHandleFormat("erik-")).toEqual({
      valid: false,
      reason: "starts-or-ends-with-hyphen",
    });
  });

  it("reports invalid-chars for unsupported characters", () => {
    expect(validateHandleFormat("erik.dev")).toEqual({ valid: false, reason: "invalid-chars" });
    expect(validateHandleFormat("erik_dev")).toEqual({ valid: false, reason: "invalid-chars" });
    expect(validateHandleFormat("erik!")).toEqual({ valid: false, reason: "invalid-chars" });
  });

  it("reports reserved for well-known names", () => {
    for (const reserved of ["admin", "api", "www", "sign-in", "dashboard"]) {
      expect(validateHandleFormat(reserved)).toEqual({ valid: false, reason: "reserved" });
    }
  });

  it("is case-insensitive against the reserved list", () => {
    expect(validateHandleFormat("ADMIN")).toEqual({ valid: false, reason: "reserved" });
  });
});

describe("RESERVED_HANDLES", () => {
  it("includes critical route prefixes that would conflict with /[handle]", () => {
    for (const name of [
      "admin",
      "api",
      "dashboard",
      "onboarding",
      "sign-in",
      "sign-up",
      "signin",
      "signup",
      "callback",
      "pricing",
      "about",
      "terms",
      "privacy",
      "demee",
      "www",
    ]) {
      expect(RESERVED_HANDLES.has(name)).toBe(true);
    }
  });

  it("contains only lowercase entries (case-insensitive check happens in validator)", () => {
    for (const name of RESERVED_HANDLES) {
      expect(name).toEqual(name.toLowerCase());
    }
  });
});
