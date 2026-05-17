import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("dhl express manifest", () => {
  it("declares courier logistics connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.dhl-express");
    expect(manifest.categories).toContain("courier-logistics");
    expect(manifest.tools.map((tool) => tool.name)).toContain("dhlExpress.trackingLookup");
  });
});
