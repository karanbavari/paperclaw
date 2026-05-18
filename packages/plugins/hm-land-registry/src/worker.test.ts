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

describe("HM Land Registry real estate plugin", () => {
  it("declares real estate category and core tools", () => {
    expect(manifest.categories).toContain("real-estate");
    expect(manifest.tools?.map((tool) => tool.name)).toContain("hm-land-registry.apiRequest");
    expect(definition.packageName).toBe("@kesarcloud/plugin-hm-land-registry");
  });
});
