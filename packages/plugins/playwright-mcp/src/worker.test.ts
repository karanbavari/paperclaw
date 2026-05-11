import { describe, expect, it } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import { createPlaywrightMcpPlugin } from "./worker.js";
import { RAW_TOOL_NAME } from "./constants.js";
import type { McpCallResult, McpToolInfo, PlaywrightMcpConfig } from "./mcp-runner.js";

function createFakeClient() {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const client = {
    calls,
    async listTools(): Promise<McpToolInfo[]> {
      return [
        { name: "browser_navigate", description: "Navigate", inputSchema: { type: "object" } },
        { name: "browser_snapshot", description: "Snapshot", inputSchema: { type: "object" } },
      ];
    },
    async callTool(name: string, args: Record<string, unknown>): Promise<McpCallResult> {
      calls.push({ name, args });
      if (name === "browser_snapshot") {
        return {
          content: [{ type: "text", text: "snapshot text" }],
          raw: {},
          text: "snapshot text",
          truncated: false,
        };
      }
      return {
        content: [{ type: "text", text: `called ${name}` }],
        raw: {},
        text: `called ${name}`,
        truncated: false,
      };
    },
    async close() {},
  };
  return client;
}

describe("playwright mcp worker", () => {
  it("proxies a static browser tool call", async () => {
    const fake = createFakeClient();
    const plugin = createPlaywrightMcpPlugin((_getConfig: () => Promise<PlaywrightMcpConfig>) => fake);
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool("browser_navigate", { url: "https://example.com" }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    });

    expect(result.content).toContain("called browser_navigate");
    expect(fake.calls).toEqual([{ name: "browser_navigate", args: { url: "https://example.com" } }]);
  });

  it("allows raw calls only for discovered tools", async () => {
    const fake = createFakeClient();
    const plugin = createPlaywrightMcpPlugin(() => fake);
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool(RAW_TOOL_NAME, {
      toolName: "browser_snapshot",
      arguments: {},
    }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    });

    expect(result.content).toContain("snapshot text");
    expect(fake.calls.at(-1)).toEqual({ name: "browser_snapshot", args: {} });
  });

  it("surfaces MCP tool errors", async () => {
    const fake = createFakeClient();
    fake.callTool = async () => ({
      content: [{ type: "text", text: "MCP failed" }],
      raw: {},
      text: "MCP failed",
      truncated: false,
      isError: true,
    });
    const plugin = createPlaywrightMcpPlugin(() => fake);
    const harness = createTestHarness({ manifest });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool("browser_navigate", { url: "https://example.com" }, {
      companyId: "company-1",
      projectId: "project-1",
      agentId: "agent-1",
      runId: "run-1",
    });

    expect(result.error).toBe("MCP failed");
  });
});
