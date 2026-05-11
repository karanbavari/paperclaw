export const PLUGIN_ID = "paperclaw.playwright-mcp";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "playwright-mcp";

export const EXPORT_NAMES = {
  page: "PlaywrightMcpPage",
  settingsPage: "PlaywrightMcpSettingsPage",
  dashboardWidget: "PlaywrightMcpDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "playwright-mcp-page",
  settingsPage: "playwright-mcp-settings-page",
  dashboardWidget: "playwright-mcp-dashboard-widget",
} as const;

export const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const RAW_TOOL_NAME = "browser.callMcpTool";

export const DEFAULT_CAPS = [
  "network",
  "storage",
  "testing",
  "vision",
  "pdf",
  "devtools",
  "config",
] as const;

export const DEFAULT_CONFIG = {
  command: "npx",
  args: ["-y", "@playwright/mcp@latest"],
  headless: true,
  browser: "",
  caps: [...DEFAULT_CAPS],
  allowedOrigins: [] as string[],
  blockedOrigins: [] as string[],
  viewportSize: "",
  device: "",
  proxyServer: "",
  proxyBypass: "",
  userDataDir: "",
  outputDir: "",
  checkConnectionOnStatus: false,
  timeoutMs: 60_000,
  maxOutputBytes: 65_536,
} as const;
