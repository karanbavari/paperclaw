import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("prestashop manifest", () => {
  it("declares ecommerce connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.prestashop");
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.tools.map((tool) => tool.name)).toContain("prestashop.productsSearch");
  });
});
