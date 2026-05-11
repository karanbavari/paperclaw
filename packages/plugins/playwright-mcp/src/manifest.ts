import type { PaperClawPluginManifestV1 } from "@kesarcloud/plugin-sdk";
import {
  DEFAULT_CAPS,
  DEFAULT_CONFIG,
  EXPORT_NAMES,
  PAGE_ROUTE,
  PLUGIN_ID,
  PLUGIN_VERSION,
  RAW_TOOL_NAME,
  SLOT_IDS,
} from "./constants.js";
import { PLAYWRIGHT_TOOLS, RAW_TOOL } from "./tool-definitions.js";

const genericObjectSchema = {
  type: "object",
  properties: {},
  additionalProperties: true,
} as const;

const manifest: PaperClawPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Playwright MCP Browser Automation",
  description: "Gives PaperClaw agents browser automation through the official Microsoft Playwright MCP server.",
  author: "PaperClaw",
  categories: ["connector", "automation", "workspace", "ui"],
  capabilities: [
    "agent.tools.register",
    "plugin.state.read",
    "plugin.state.write",
    "activity.log.write",
    "instance.settings.register",
    "ui.page.register",
    "ui.dashboardWidget.register",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  instanceConfigSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        title: "MCP Command",
        default: DEFAULT_CONFIG.command,
        description: "Executable used to start Playwright MCP.",
      },
      args: {
        type: "array",
        title: "MCP Args",
        default: DEFAULT_CONFIG.args,
        items: { type: "string" },
      },
      headless: {
        type: "boolean",
        title: "Headless Browser",
        default: DEFAULT_CONFIG.headless,
      },
      browser: {
        type: "string",
        title: "Browser",
        default: DEFAULT_CONFIG.browser,
        description: "Optional browser override: chrome, firefox, webkit, or msedge.",
      },
      caps: {
        type: "array",
        title: "Capabilities",
        default: DEFAULT_CAPS,
        items: { type: "string" },
      },
      allowedOrigins: {
        type: "array",
        title: "Allowed Origins",
        default: DEFAULT_CONFIG.allowedOrigins,
        items: { type: "string" },
      },
      blockedOrigins: {
        type: "array",
        title: "Blocked Origins",
        default: DEFAULT_CONFIG.blockedOrigins,
        items: { type: "string" },
      },
      viewportSize: {
        type: "string",
        title: "Viewport Size",
        default: DEFAULT_CONFIG.viewportSize,
        description: "Optional viewport such as 1280x720.",
      },
      device: {
        type: "string",
        title: "Device",
        default: DEFAULT_CONFIG.device,
        description: "Optional Playwright device name such as iPhone 15.",
      },
      proxyServer: {
        type: "string",
        title: "Proxy Server",
        default: DEFAULT_CONFIG.proxyServer,
      },
      proxyBypass: {
        type: "string",
        title: "Proxy Bypass",
        default: DEFAULT_CONFIG.proxyBypass,
      },
      userDataDir: {
        type: "string",
        title: "User Data Directory",
        default: DEFAULT_CONFIG.userDataDir,
      },
      outputDir: {
        type: "string",
        title: "Output Directory",
        default: DEFAULT_CONFIG.outputDir,
      },
      checkConnectionOnStatus: {
        type: "boolean",
        title: "Check Connection On Status",
        default: DEFAULT_CONFIG.checkConnectionOnStatus,
        description: "When enabled, plugin status starts Playwright MCP and lists tools. Disabled by default because npx first-run can be slow.",
      },
      timeoutMs: {
        type: "number",
        title: "MCP Timeout Milliseconds",
        default: DEFAULT_CONFIG.timeoutMs,
        minimum: 5000,
        maximum: 300000,
      },
      maxOutputBytes: {
        type: "number",
        title: "Max Output Bytes",
        default: DEFAULT_CONFIG.maxOutputBytes,
        minimum: 4000,
        maximum: 1000000,
      },
    },
  },
  tools: [
    ...PLAYWRIGHT_TOOLS.map((tool) => ({
      name: tool.name,
      displayName: tool.displayName,
      description: tool.description,
      parametersSchema: genericObjectSchema,
    })),
    {
      name: RAW_TOOL_NAME,
      displayName: RAW_TOOL.displayName,
      description: RAW_TOOL.description,
      parametersSchema: {
        type: "object",
        properties: {
          toolName: { type: "string" },
          arguments: { type: "object" },
        },
        required: ["toolName"],
      },
    },
  ],
  ui: {
    slots: [
      { type: "page", id: SLOT_IDS.page, displayName: "Playwright MCP", exportName: EXPORT_NAMES.page, routePath: PAGE_ROUTE },
      { type: "settingsPage", id: SLOT_IDS.settingsPage, displayName: "Playwright MCP", exportName: EXPORT_NAMES.settingsPage },
      { type: "dashboardWidget", id: SLOT_IDS.dashboardWidget, displayName: "Playwright MCP", exportName: EXPORT_NAMES.dashboardWidget },
    ],
  },
};

export default manifest;
