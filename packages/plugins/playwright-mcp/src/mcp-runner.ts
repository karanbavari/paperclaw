import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport, type StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";
import { DEFAULT_CAPS, DEFAULT_CONFIG, PLUGIN_VERSION } from "./constants.js";

export type PlaywrightMcpConfig = {
  command: string;
  args: string[];
  headless: boolean;
  browser: string;
  caps: string[];
  allowedOrigins: string[];
  blockedOrigins: string[];
  viewportSize: string;
  device: string;
  proxyServer: string;
  proxyBypass: string;
  userDataDir: string;
  outputDir: string;
  checkConnectionOnStatus: boolean;
  timeoutMs: number;
  maxOutputBytes: number;
};

export type McpToolInfo = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

export type McpCallResult = {
  content: unknown[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
  raw: unknown;
  text: string;
  truncated: boolean;
};

type ClientBundle = {
  client: Client;
  transport: StdioClientTransport;
  stderr: string;
};

const SHELL_META_PATTERN = /[;&|`$<>\\\n\r]/;
const ALLOWED_CAPS = new Set(["network", "storage", "testing", "vision", "pdf", "devtools", "config"]);

export function normalizeConfig(raw: Record<string, unknown>): PlaywrightMcpConfig {
  return {
    command: normalizeToken(raw.command, DEFAULT_CONFIG.command),
    args: normalizeArgs(raw.args),
    headless: typeof raw.headless === "boolean" ? raw.headless : DEFAULT_CONFIG.headless,
    browser: normalizeToken(raw.browser, DEFAULT_CONFIG.browser),
    caps: normalizeCaps(raw.caps),
    allowedOrigins: normalizeStringList(raw.allowedOrigins),
    blockedOrigins: normalizeStringList(raw.blockedOrigins),
    viewportSize: normalizeToken(raw.viewportSize, DEFAULT_CONFIG.viewportSize),
    device: normalizeLooseToken(raw.device, DEFAULT_CONFIG.device),
    proxyServer: normalizeLooseToken(raw.proxyServer, DEFAULT_CONFIG.proxyServer),
    proxyBypass: normalizeLooseToken(raw.proxyBypass, DEFAULT_CONFIG.proxyBypass),
    userDataDir: normalizeLooseToken(raw.userDataDir, DEFAULT_CONFIG.userDataDir),
    outputDir: normalizeLooseToken(raw.outputDir, DEFAULT_CONFIG.outputDir),
    checkConnectionOnStatus: typeof raw.checkConnectionOnStatus === "boolean"
      ? raw.checkConnectionOnStatus
      : DEFAULT_CONFIG.checkConnectionOnStatus,
    timeoutMs: normalizeNumber(raw.timeoutMs, DEFAULT_CONFIG.timeoutMs, 5_000, 300_000),
    maxOutputBytes: normalizeNumber(raw.maxOutputBytes, DEFAULT_CONFIG.maxOutputBytes, 4_000, 1_000_000),
  };
}

export function validateConfig(raw: Record<string, unknown>) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!config.command) errors.push("Playwright MCP command is required.");
  if (!config.args.some((arg) => arg.includes("@playwright/mcp"))) {
    warnings.push("Command args do not include @playwright/mcp; ensure the configured MCP server exposes Playwright browser tools.");
  }
  if (config.allowedOrigins.length === 0) {
    warnings.push("No allowed origins configured. Browser automation can navigate to any origin not blocked.");
  }
  if (!config.headless) {
    warnings.push("Headed mode is enabled. Use headless mode on servers without a display.");
  }
  return { config, errors, warnings };
}

export function buildPlaywrightMcpArgs(config: PlaywrightMcpConfig) {
  const args = [...config.args];
  if (config.headless && !args.includes("--headless")) args.push("--headless");
  pushOption(args, "caps", config.caps.join(","));
  pushOption(args, "browser", config.browser);
  pushOption(args, "viewport-size", config.viewportSize);
  pushOption(args, "device", config.device);
  pushOption(args, "proxy-server", config.proxyServer);
  pushOption(args, "proxy-bypass", config.proxyBypass);
  pushOption(args, "user-data-dir", config.userDataDir);
  pushOption(args, "output-dir", config.outputDir);
  pushOption(args, "allowed-origins", config.allowedOrigins.join(","));
  pushOption(args, "blocked-origins", config.blockedOrigins.join(","));
  return args;
}

export function buildServerParameters(config: PlaywrightMcpConfig): StdioServerParameters {
  return {
    command: config.command,
    args: buildPlaywrightMcpArgs(config),
    stderr: "pipe",
  };
}

export class PlaywrightMcpClient {
  private bundle: ClientBundle | null = null;
  private activeConfigKey = "";

  constructor(private readonly getConfig: () => Promise<PlaywrightMcpConfig>) {}

  async listTools(): Promise<McpToolInfo[]> {
    const bundle = await this.ensureClient();
    const result = await bundle.client.listTools(undefined, { timeout: (await this.getConfig()).timeoutMs });
    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema as Record<string, unknown>,
    }));
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<McpCallResult> {
    const config = await this.getConfig();
    const bundle = await this.ensureClient(config);
    try {
      const result = await bundle.client.callTool(
        { name, arguments: args },
        undefined,
        { timeout: config.timeoutMs },
      );
      return normalizeMcpResult(result, config.maxOutputBytes);
    } catch (err) {
      await this.close();
      throw err;
    }
  }

  async close() {
    if (!this.bundle) return;
    const current = this.bundle;
    this.bundle = null;
    this.activeConfigKey = "";
    await current.transport.close().catch(() => undefined);
  }

  async stderr() {
    return this.bundle?.stderr ?? "";
  }

  private async ensureClient(config?: PlaywrightMcpConfig) {
    config ??= await this.getConfig();
    const key = JSON.stringify({
      command: config.command,
      args: buildPlaywrightMcpArgs(config),
    });
    if (this.bundle && this.activeConfigKey === key) return this.bundle;
    await this.close();

    const client = new Client({ name: "paperclaw-playwright-mcp", version: PLUGIN_VERSION }, { capabilities: {} });
    const transport = new StdioClientTransport(buildServerParameters(config));
    const bundle: ClientBundle = { client, transport, stderr: "" };
    transport.stderr?.on("data", (chunk) => {
      bundle.stderr = truncateUtf8(bundle.stderr + String(chunk), 16_000);
    });
    await client.connect(transport, { timeout: config.timeoutMs });
    this.bundle = bundle;
    this.activeConfigKey = key;
    return bundle;
  }
}

export function normalizeMcpResult(result: unknown, maxOutputBytes: number): McpCallResult {
  const object = typeof result === "object" && result !== null ? result as Record<string, unknown> : {};
  const content = Array.isArray(object.content) ? object.content : [];
  const text = contentToText(content);
  const truncatedText = truncateUtf8(text, maxOutputBytes);
  return {
    content,
    structuredContent: typeof object.structuredContent === "object" && object.structuredContent !== null
      ? object.structuredContent as Record<string, unknown>
      : undefined,
    isError: object.isError === true,
    raw: result,
    text: truncatedText,
    truncated: Buffer.byteLength(text) > maxOutputBytes,
  };
}

function contentToText(content: unknown[]) {
  const parts: string[] = [];
  for (const item of content) {
    if (typeof item !== "object" || item === null) continue;
    const entry = item as Record<string, unknown>;
    if (entry.type === "text" && typeof entry.text === "string") {
      parts.push(entry.text);
    } else if (entry.type === "image") {
      parts.push(`[image: ${typeof entry.mimeType === "string" ? entry.mimeType : "unknown"}]`);
    } else if (entry.type === "resource") {
      parts.push("[resource]");
    } else {
      parts.push(JSON.stringify(entry));
    }
  }
  return parts.join("\n").trim();
}

function pushOption(args: string[], name: string, value: string) {
  if (!value) return;
  const prefix = `--${name}`;
  if (args.some((arg) => arg === prefix || arg.startsWith(`${prefix}=`))) return;
  args.push(`${prefix}=${value}`);
}

function normalizeArgs(value: unknown) {
  const source = Array.isArray(value) && value.length > 0 ? value : DEFAULT_CONFIG.args;
  const args = source
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item && !SHELL_META_PATTERN.test(item));
  return args.length > 0 ? args : [...DEFAULT_CONFIG.args];
}

function normalizeCaps(value: unknown) {
  const source = Array.isArray(value) ? value : DEFAULT_CAPS;
  const caps = source
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => ALLOWED_CAPS.has(item));
  return caps.length > 0 ? [...new Set(caps)] : [...DEFAULT_CAPS];
}

function normalizeStringList(value: unknown) {
  const source = Array.isArray(value) ? value : [];
  return source
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item && !SHELL_META_PATTERN.test(item));
}

function normalizeToken(value: unknown, fallback: string) {
  const raw = typeof value === "string" && value.trim() ? value.trim() : fallback;
  if (SHELL_META_PATTERN.test(raw)) return fallback;
  return raw;
}

function normalizeLooseToken(value: unknown, fallback: string) {
  const raw = typeof value === "string" && value.trim() ? value.trim() : fallback;
  if (SHELL_META_PATTERN.test(raw)) return fallback;
  return raw;
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function truncateUtf8(value: string, maxBytes: number) {
  if (Buffer.byteLength(value) <= maxBytes) return value;
  return Buffer.from(value).subarray(0, maxBytes).toString("utf8");
}
