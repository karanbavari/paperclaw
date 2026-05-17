import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("adobe commerce manifest", () => {
  it("declares ecommerce connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.adobe-commerce");
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.tools.map((tool) => tool.name)).toContain("adobeCommerce.productsSearch");
  });
});
