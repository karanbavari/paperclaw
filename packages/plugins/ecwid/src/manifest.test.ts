import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("ecwid manifest", () => {
  it("declares ecommerce connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.ecwid");
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.tools.map((tool) => tool.name)).toContain("ecwid.ordersSearch");
  });
});
