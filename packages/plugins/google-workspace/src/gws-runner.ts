import { spawn } from "node:child_process";
import { DEFAULT_ALLOWED_SERVICES, DEFAULT_CONFIG } from "./constants.js";

export type GoogleWorkspaceConfig = {
  gwsBinaryPath: string;
  gwsConfigDir: string;
  dryRun: boolean;
  enableRawGwsTool: boolean;
  allowedServices: string[];
  maxOutputBytes: number;
  timeoutMs: number;
};

export type GwsCommandPlan = {
  service: string;
  args: string[];
  mutating: boolean;
  summary: string;
};

export type GwsRunResult = {
  command: string;
  args: string[];
  code: number | null;
  stdout: string;
  stderr: string;
  parsed: unknown;
  truncated: boolean;
  dryRun: boolean;
};

type CommandInput = {
  service: string;
  parts: string[];
  params?: unknown;
  json?: unknown;
  extraArgs?: string[];
  mutating?: boolean;
  summary: string;
};

const SHELL_META_PATTERN = /[;&|`$<>\\\n\r]/;

export function normalizeConfig(raw: Record<string, unknown>): GoogleWorkspaceConfig {
  return {
    gwsBinaryPath: normalizeBinaryPath(raw.gwsBinaryPath),
    gwsConfigDir: typeof raw.gwsConfigDir === "string" ? raw.gwsConfigDir.trim() : "",
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : DEFAULT_CONFIG.dryRun,
    enableRawGwsTool: typeof raw.enableRawGwsTool === "boolean" ? raw.enableRawGwsTool : DEFAULT_CONFIG.enableRawGwsTool,
    allowedServices: normalizeAllowedServices(raw.allowedServices),
    maxOutputBytes: normalizeNumber(raw.maxOutputBytes, DEFAULT_CONFIG.maxOutputBytes, 4_000, 500_000),
    timeoutMs: normalizeNumber(raw.timeoutMs, DEFAULT_CONFIG.timeoutMs, 5_000, 120_000),
  };
}

export function validateConfig(raw: Record<string, unknown>) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!config.gwsBinaryPath) errors.push("gws binary path is required.");
  if (config.enableRawGwsTool) {
    warnings.push("Raw gws tool is enabled. Keep allowed services narrow for production agents.");
  }
  if (config.dryRun) {
    warnings.push("Dry run is enabled. Mutating Workspace tools will preview commands without changing Google Workspace.");
  }
  if (!config.gwsConfigDir) {
    warnings.push("Using default gws auth directory. Set gwsConfigDir if PaperClaw should use a specific authenticated profile.");
  }
  return { config, errors, warnings };
}

export function buildGwsCommand(input: CommandInput): GwsCommandPlan {
  assertSafeToken(input.service, "service");
  for (const part of input.parts) assertSafeToken(part, "command part");

  const args = [input.service, ...input.parts];
  if (input.params !== undefined) args.push("--params", JSON.stringify(input.params));
  if (input.json !== undefined) args.push("--json", JSON.stringify(input.json));
  for (const extra of input.extraArgs ?? []) {
    assertSafeToken(extra, "extra argument");
    args.push(extra);
  }
  return {
    service: input.service,
    args,
    mutating: input.mutating === true,
    summary: input.summary,
  };
}

export function buildRawGwsCommand(input: {
  service: string;
  resource?: string;
  method: string;
  params?: unknown;
  json?: unknown;
  dryRun?: boolean;
}) {
  const parts = [
    ...(input.resource ? input.resource.split(".").filter(Boolean) : []),
    ...input.method.split(".").filter(Boolean),
  ];
  const plan = buildGwsCommand({
    service: input.service,
    parts,
    params: input.params,
    json: input.json,
    mutating: true,
    summary: `raw ${input.service} ${parts.join(".")}`,
  });
  if (input.dryRun === true && !plan.args.includes("--dry-run")) plan.args.push("--dry-run");
  return plan;
}

export function isServiceAllowed(config: GoogleWorkspaceConfig, service: string) {
  return new Set(config.allowedServices).has(service);
}

export async function runGwsCommand(config: GoogleWorkspaceConfig, plan: GwsCommandPlan): Promise<GwsRunResult> {
  if (!isServiceAllowed(config, plan.service)) {
    throw new Error(`Google Workspace service "${plan.service}" is not allowed by plugin settings.`);
  }

  const args = config.dryRun && plan.mutating && !plan.args.includes("--dry-run")
    ? [...plan.args, "--dry-run"]
    : plan.args;
  const effectiveDryRun = args.includes("--dry-run");
  const env = {
    ...process.env,
    ...(config.gwsConfigDir ? { GOOGLE_WORKSPACE_CLI_CONFIG_DIR: config.gwsConfigDir } : {}),
  };

  let stdout = "";
  let stderr = "";
  let truncated = false;
  const child = spawn(config.gwsBinaryPath, args, { env, stdio: ["ignore", "pipe", "pipe"] });
  const timer = setTimeout(() => child.kill("SIGTERM"), config.timeoutMs);

  child.stdout.on("data", (chunk) => {
    const next = stdout + String(chunk);
    if (Buffer.byteLength(next) > config.maxOutputBytes) truncated = true;
    stdout = truncateUtf8(next, config.maxOutputBytes);
  });
  child.stderr.on("data", (chunk) => {
    const next = stderr + String(chunk);
    stderr = truncateUtf8(next, Math.min(config.maxOutputBytes, 16_000));
  });

  const code = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  }).finally(() => clearTimeout(timer));

  const parsed = parseOutput(stdout);
  return {
    command: config.gwsBinaryPath,
    args,
    code,
    stdout,
    stderr,
    parsed,
    truncated,
    dryRun: effectiveDryRun,
  };
}

export function summarizeGwsResult(result: GwsRunResult) {
  if (result.code === 0) return result.parsed ?? result.stdout;
  const detail = result.stderr || result.stdout || `gws exited with code ${result.code}`;
  throw new Error(detail);
}

function assertSafeToken(value: string, label: string) {
  if (!value || SHELL_META_PATTERN.test(value)) {
    throw new Error(`Unsafe ${label}: ${value}`);
  }
}

function normalizeBinaryPath(value: unknown) {
  const raw = typeof value === "string" && value.trim() ? value.trim() : DEFAULT_CONFIG.gwsBinaryPath;
  if (SHELL_META_PATTERN.test(raw)) return DEFAULT_CONFIG.gwsBinaryPath;
  return raw;
}

function normalizeAllowedServices(value: unknown) {
  const source = Array.isArray(value) ? value : DEFAULT_ALLOWED_SERVICES;
  const services = source
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item && !SHELL_META_PATTERN.test(item));
  return services.length > 0 ? [...new Set(services)] : [...DEFAULT_ALLOWED_SERVICES];
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

function parseOutput(stdout: string) {
  const text = stdout.trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length > 1) {
      const parsedLines: unknown[] = [];
      for (const line of lines) {
        try {
          parsedLines.push(JSON.parse(line));
        } catch {
          return text;
        }
      }
      return parsedLines;
    }
    return text;
  }
}
