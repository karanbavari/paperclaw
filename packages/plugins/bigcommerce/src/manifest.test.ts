import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("bigcommerce manifest", () => {
  it("declares ecommerce connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.bigcommerce");
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.tools.map((tool) => tool.name)).toContain("bigcommerce.ordersSearch");
  });
});
