import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("woocommerce manifest", () => {
  it("declares ecommerce connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.woocommerce");
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.tools.map((tool) => tool.name)).toContain("woocommerce.productsSearch");
  });
});
