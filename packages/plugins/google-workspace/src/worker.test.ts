import { describe, expect, it } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { TOOL_NAMES } from "./constants.js";

describe("google workspace worker", () => {
  it("returns planned mutating commands in dry-run mode without executing gws", async () => {
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(TOOL_NAMES.calendarCreateEvent, {
      summary: "Demo",
      start: "2026-05-12T10:00:00+05:30",
      end: "2026-05-12T10:30:00+05:30",
    }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    });

    expect(result.content).toContain("Dry run prepared");
    expect(result.content).toContain("gws was not executed");
    expect(result.data).toMatchObject({
      dryRun: true,
      service: "calendar",
    });
  });
});
