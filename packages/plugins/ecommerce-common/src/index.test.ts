import { describe, expect, it } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import { createEcommerceManifest, createEcommercePlugin, normalizeConfig, type EcommercePlatformSpec } from "./index.js";

const spec: EcommercePlatformSpec = {
  slug: "demo-commerce",
  toolPrefix: "demoCommerce",
  pluginId: "paperclaw.demo-commerce",
  packageName: "@kesarcloud/plugin-demo-commerce",
  displayName: "Demo Commerce",
  description: "Demo ecommerce connector.",
  defaultBaseUrl: "https://api.example.com",
  authKind: "bearer",
  docsUrl: "https://example.com/docs",
  setupNotes: "Use a test token.",
  endpoints: {
    overview: { method: "GET", path: "/store" },
    productsSearch: { method: "GET", path: "/products", queryParam: "q" },
    productGet: { method: "GET", path: "/products/{productId}" },
    productCreate: { method: "POST", path: "/products", requires: "create" },
  },
};

describe("ecommerce common helpers", () => {
  it("keeps mutating tools in dry-run by default", async () => {
    const manifest = createEcommerceManifest(spec);
    const plugin = createEcommercePlugin(spec);
    const harness = createTestHarness({ manifest, config: {} });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool("demoCommerce.productCreate", { product: { name: "Test" } });

    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject({ dryRun: true });
  });

  it("normalizes base URL and default guardrails", () => {
    const config = normalizeConfig(spec, { baseUrl: "https://api.example.com/" });
    expect(config.baseUrl).toBe("https://api.example.com");
    expect(config.dryRun).toBe(true);
    expect(config.allowedOperations).toContain("orders");
  });

  it("declares ecommerce UI slots", () => {
    const manifest = createEcommerceManifest(spec);
    expect(manifest.categories).toContain("ecommerce");
    expect(manifest.ui?.slots.map((slot) => slot.exportName)).toContain("EcommercePage");
  });
});
