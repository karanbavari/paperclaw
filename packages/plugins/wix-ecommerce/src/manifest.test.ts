import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("wix ecommerce manifest", () => {
  it("declares ecommerce connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.wix-ecommerce");
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.tools.map((tool) => tool.name)).toContain("wixEcommerce.productsSearch");
  });
});
