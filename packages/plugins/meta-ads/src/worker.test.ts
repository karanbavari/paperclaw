import { describe, expect, it } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { TOOL_NAMES } from "./constants.js";

describe("meta ads worker", () => {
  it("returns planned mutating commands in dry-run mode without executing Meta CLI", async () => {
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.campaignCreate, {
      adAccountId: "act_123",
      campaign: {
        name: "Demo Campaign",
        objective: "OUTCOME_LEADS",
        status: "PAUSED",
        dailyBudgetCents: 1000,
      },
    }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    });

    expect(result.content).toContain("Dry run prepared");
    expect(result.content).toContain("Meta CLI was not executed");
    expect(result.data).toMatchObject({
      dryRun: true,
      operation: "create",
      adAccountId: "act_123",
    });
  });
});
