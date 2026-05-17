import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("fedex manifest", () => {
  it("declares courier logistics connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.fedex");
    expect(manifest.categories).toContain("courier-logistics");
    expect(manifest.tools.map((tool) => tool.name)).toContain("fedex.trackingLookup");
  });
});
