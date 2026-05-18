import { describe, expect, it, vi } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { definition } from "./definition.js";

const runCtx = {
  companyId: "company-1",
  projectId: "project-1",
  agentId: "agent-1",
  runId: "run-1",
};

describe("Plivo communication plugin", () => {
  it("declares communication category and core tools", () => {
    expect(manifest.categories).toContain("communication");
    expect(manifest.tools?.map((tool) => tool.name)).toContain("plivo.apiRequest");
    expect(definition.packageName).toBe("@kesarcloud/plugin-plivo");
  });

  it("prepares mutating requests without calling external APIs in dry-run mode", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const harness = createTestHarness({
      manifest,
      config: {
        authMode: "token",
        accessTokenSecretRef: "00000000-0000-4000-8000-000000000001",
        connectedCompanyId: runCtx.companyId,
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool("plivo.messageCreate", {
      "authId": "MA00000000000000000000000000000000",
      "message": {
            "to": "+15551234567",
            "text": "Example"
      }
}, runCtx);

    expect(result.content).toContain("Dry run");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.data).toMatchObject({ dryRun: true });
  });
});
