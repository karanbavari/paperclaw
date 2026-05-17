import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("ups manifest", () => {
  it("declares courier logistics connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.ups");
    expect(manifest.categories).toContain("courier-logistics");
    expect(manifest.tools.map((tool) => tool.name)).toContain("ups.rateQuote");
  });
});
