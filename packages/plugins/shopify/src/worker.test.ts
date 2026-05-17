import { describe, expect, it } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { TOOL_NAMES } from "./constants.js";

describe("shopify worker", () => {
  it("returns planned mutating GraphQL in dry-run mode without calling Shopify", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        appApiKey: "client-id",
        appApiSecretRef: "00000000-0000-4000-8000-000000000001",
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.productCreate, {
      shop: "demo-store.myshopify.com",
      product: {
        title: "Demo Product",
        status: "DRAFT",
      },
    }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    });

    expect(result.content).toContain("Dry run prepared");
    expect(result.content).toContain("Shopify was not changed");
    expect(result.data).toMatchObject({
      dryRun: true,
      operation: "create",
      shop: "demo-store.myshopify.com",
    });
  });

  it("rejects disallowed shops before building a command", async () => {
    const harness = createTestHarness({
      manifest,
      config: {
        appApiKey: "client-id",
        appApiSecretRef: "00000000-0000-4000-8000-000000000001",
        allowedShopDomains: ["allowed.myshopify.com"],
      },
    });
    await plugin.definition.setup(harness.ctx);

    await expect(harness.executeTool(TOOL_NAMES.shopOverview, {
      shop: "blocked.myshopify.com",
    }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    })).rejects.toThrow("not allowed");
  });
});
