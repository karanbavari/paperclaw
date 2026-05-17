import { describe, expect, it } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import { createLogisticsManifest, createLogisticsPlugin, normalizeConfig, type LogisticsPlatformSpec } from "./index.js";

const spec: LogisticsPlatformSpec = {
  slug: "demo-logistics",
  toolPrefix: "demoLogistics",
  pluginId: "paperclaw.demo-logistics",
  packageName: "@kesarcloud/plugin-demo-logistics",
  displayName: "Demo Logistics",
  description: "Demo logistics connector.",
  defaultBaseUrl: "https://api.example.com",
  authKind: "bearer",
  docsUrl: "https://example.com/docs",
  setupNotes: "Use test credentials.",
  endpoints: {
    overview: { method: "GET", path: "/account" },
    rateQuote: { method: "POST", path: "/rates", mutating: false },
    labelCreate: { method: "POST", path: "/labels", mutating: true },
    trackingLookup: { method: "GET", path: "/track/{trackingNumber}" },
  },
};

describe("logistics common helpers", () => {
  it("keeps label creation in dry-run by default", async () => {
    const manifest = createLogisticsManifest(spec);
    const plugin = createLogisticsPlugin(spec);
    const harness = createTestHarness({ manifest, config: { allowedOperations: ["read", "labels"] } });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool("demoLogistics.labelCreate", { label: { service: "ground" } });

    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject({ dryRun: true });
  });

  it("blocks label operations unless allowed", async () => {
    const manifest = createLogisticsManifest(spec);
    const plugin = createLogisticsPlugin(spec);
    const harness = createTestHarness({ manifest, config: {} });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool("demoLogistics.labelCreate", { label: { service: "ground" } });

    expect(result.error).toContain("labels");
  });

  it("normalizes defaults", () => {
    const config = normalizeConfig(spec, { baseUrl: "https://api.example.com/" });
    expect(config.baseUrl).toBe("https://api.example.com");
    expect(config.dryRun).toBe(true);
    expect(config.allowedOperations).toEqual(["read", "rates", "tracking", "addresses"]);
  });

  it("declares courier logistics UI slots", () => {
    const manifest = createLogisticsManifest(spec);
    expect(manifest.categories).toContain("courier-logistics");
    expect(manifest.ui?.slots.map((slot) => slot.exportName)).toContain("LogisticsPage");
  });
});
