import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("should merge classes correctly", () => {
    expect(cn("px-2 py-1", "px-3")).toBe("py-1 px-3");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", { "conditional": true })).toBe("base conditional");
    expect(cn("base", { "conditional": false })).toBe("base");
  });
});
