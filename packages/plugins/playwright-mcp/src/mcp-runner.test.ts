import { describe, expect, it } from "vitest";
import {
  buildPlaywrightMcpArgs,
  normalizeConfig,
  normalizeMcpResult,
} from "./mcp-runner.js";

describe("playwright mcp runner", () => {
  it("builds full automation args by default", () => {
    const config = normalizeConfig({});
    expect(buildPlaywrightMcpArgs(config)).toEqual([
      "-y",
      "@playwright/mcp@latest",
      "--headless",
      "--caps=network,storage,testing,vision,pdf,devtools,config",
    ]);
  });

  it("adds browser and origin guard options", () => {
    const config = normalizeConfig({
      browser: "firefox",
      allowedOrigins: ["https://example.com"],
      blockedOrigins: ["https://blocked.example"],
      viewportSize: "1280x720",
    });
    const args = buildPlaywrightMcpArgs(config);
    expect(args).toContain("--browser=firefox");
    expect(args).toContain("--allowed-origins=https://example.com");
    expect(args).toContain("--blocked-origins=https://blocked.example");
    expect(args).toContain("--viewport-size=1280x720");
  });

  it("filters unsafe command args and capability values", () => {
    const config = normalizeConfig({
      args: ["@playwright/mcp@latest", "bad;rm -rf /"],
      caps: ["network", "bad", "pdf"],
    });
    expect(config.args).toEqual(["@playwright/mcp@latest"]);
    expect(config.caps).toEqual(["network", "pdf"]);
  });

  it("summarizes and truncates MCP text output", () => {
    const result = normalizeMcpResult({
      content: [{ type: "text", text: "abcdef" }],
    }, 3);
    expect(result.text.length).toBeLessThanOrEqual(3);
    expect(result.truncated).toBe(true);
  });
});
