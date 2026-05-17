import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("square commerce manifest", () => {
  it("declares ecommerce connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.square-commerce");
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.tools.map((tool) => tool.name)).toContain("squareCommerce.ordersSearch");
  });
});
