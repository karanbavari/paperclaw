import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("aftership manifest", () => {
  it("declares courier logistics connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.aftership");
    expect(manifest.categories).toContain("courier-logistics");
    expect(manifest.tools.map((tool) => tool.name)).toContain("aftership.trackingLookup");
  });
});
