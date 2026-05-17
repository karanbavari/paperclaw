import { describe, expect, it } from "vitest";
import manifest from "./manifest.js";

describe("commercetools manifest", () => {
  it("declares ecommerce connector metadata", () => {
    expect(manifest.id).toBe("paperclaw.commercetools");
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.tools.map((tool) => tool.name)).toContain("commercetools.customersSearch");
  });
});
