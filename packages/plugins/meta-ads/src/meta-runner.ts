import { spawn } from "node:child_process";
import { DEFAULT_ALLOWED_OPERATIONS, DEFAULT_CONFIG } from "./constants.js";

export type MetaOperation = "read" | "create" | "update" | "diagnostics" | "raw";

export type MetaAdsConfig = {
  metaCliBinaryPath: string;
  metaConfigDir: string;
  dryRun: boolean;
  enableRawMetaTool: boolean;
  allowedOperations: string[];
  allowedAdAccountIds: string[];
  maxBudgetChangePercent: number;
  maxDailyBudgetCents: number;
  maxOutputBytes: number;
  timeoutMs: number;
};

export type MetaCommandPlan = {
  args: string[];
  operation: MetaOperation;
  mutating: boolean;
  summary: string;
  adAccountId?: string;
};

export type MetaRunResult = {
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
  parts: string[];
  operation: MetaOperation;
  summary: string;
  adAccountId?: string;
  businessId?: string;
  catalogId?: string;
  entityId?: string;
  params?: Record<string, unknown>;
  json?: unknown;
  mutating?: boolean;
};

const SHELL_META_PATTERN = /[;&|`$<>\\\n\r]/;
const BUDGET_FIELD_PATTERN = /budget|spend|bid/i;
const PERCENT_FIELD_PATTERN = /percent|percentage|changePercent/i;

export function normalizeConfig(raw: Record<string, unknown>): MetaAdsConfig {
  return {
    metaCliBinaryPath: normalizeBinaryPath(raw.metaCliBinaryPath),
    metaConfigDir: typeof raw.metaConfigDir === "string" ? raw.metaConfigDir.trim() : "",
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : DEFAULT_CONFIG.dryRun,
    enableRawMetaTool: typeof raw.enableRawMetaTool === "boolean" ? raw.enableRawMetaTool : DEFAULT_CONFIG.enableRawMetaTool,
    allowedOperations: normalizeStringList(raw.allowedOperations, DEFAULT_ALLOWED_OPERATIONS),
    allowedAdAccountIds: normalizeStringList(raw.allowedAdAccountIds, []),
    maxBudgetChangePercent: normalizeNumber(raw.maxBudgetChangePercent, DEFAULT_CONFIG.maxBudgetChangePercent, 0, 100),
    maxDailyBudgetCents: normalizeNumber(raw.maxDailyBudgetCents, DEFAULT_CONFIG.maxDailyBudgetCents, 0, 50_000_000),
    maxOutputBytes: normalizeNumber(raw.maxOutputBytes, DEFAULT_CONFIG.maxOutputBytes, 4_000, 500_000),
    timeoutMs: normalizeNumber(raw.timeoutMs, DEFAULT_CONFIG.timeoutMs, 5_000, 120_000),
  };
}

export function validateConfig(raw: Record<string, unknown>) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!config.metaCliBinaryPath) errors.push("Meta CLI binary path is required.");
  if (config.enableRawMetaTool) {
    warnings.push("Raw Meta CLI tool is enabled. Keep allowed operations and ad accounts narrow for production agents.");
  }
  if (config.dryRun) {
    warnings.push("Dry run is enabled. Mutating Meta Ads tools will preview commands without changing campaigns.");
  }
  if (config.allowedAdAccountIds.length === 0) {
    warnings.push("No ad account allowlist is configured. Tools may target any Meta ad account available to the authenticated CLI profile.");
  }
  return { config, errors, warnings };
}

export function buildMetaCommand(input: CommandInput): MetaCommandPlan {
  for (const part of input.parts) assertSafeToken(part, "command part");
  if (input.adAccountId) assertSafeToken(input.adAccountId, "ad account id");
  if (input.businessId) assertSafeToken(input.businessId, "business id");
  if (input.catalogId) assertSafeToken(input.catalogId, "catalog id");
  if (input.entityId) assertSafeToken(input.entityId, "entity id");

  const args = ["ads", ...input.parts];
  if (input.adAccountId) args.push("--ad-account-id", input.adAccountId);
  if (input.businessId) args.push("--business-id", input.businessId);
  if (input.catalogId) args.push("--catalog-id", input.catalogId);
  if (input.entityId) args.push("--id", input.entityId);

  for (const [key, value] of Object.entries(input.params ?? {})) {
    assertSafeToken(key, "parameter name");
    if (value === undefined || value === null || value === "") continue;
    args.push(`--${key}`, String(value));
  }
  if (input.json !== undefined) args.push("--json", JSON.stringify(input.json));

  return {
    args,
    operation: input.operation,
    mutating: input.mutating === true || input.operation === "create" || input.operation === "update",
    summary: input.summary,
    adAccountId: input.adAccountId,
  };
}

export function buildRawMetaCommand(input: {
  args: string[];
  operation?: MetaOperation;
  adAccountId?: string;
  dryRun?: boolean;
  summary?: string;
}) {
  if (!Array.isArray(input.args) || input.args.length === 0) {
    throw new Error("Raw Meta CLI args must be a non-empty array.");
  }
  for (const arg of input.args) assertSafeToken(arg, "raw argument");
  const operation = input.operation ?? "raw";
  const args = input.dryRun === true && !input.args.includes("--dry-run")
    ? [...input.args, "--dry-run"]
    : [...input.args];
  return {
    args,
    operation,
    mutating: operation === "create" || operation === "update" || operation === "raw",
    summary: input.summary ?? `raw Meta CLI ${args.join(" ")}`,
    adAccountId: input.adAccountId,
  } satisfies MetaCommandPlan;
}

export function ensurePlanAllowed(config: MetaAdsConfig, plan: MetaCommandPlan, payload?: unknown) {
  if (!isOperationAllowed(config, plan.operation)) {
    throw new Error(`Meta Ads operation "${plan.operation}" is not allowed by plugin settings.`);
  }
  if (plan.adAccountId && !isAdAccountAllowed(config, plan.adAccountId)) {
    throw new Error(`Meta Ads account "${plan.adAccountId}" is not allowed by plugin settings.`);
  }
  if (plan.mutating) enforceBudgetGuards(config, payload);
}

export function isOperationAllowed(config: MetaAdsConfig, operation: MetaOperation) {
  if (operation === "raw") return config.enableRawMetaTool && config.allowedOperations.includes("raw");
  return config.allowedOperations.includes(operation);
}

export function isAdAccountAllowed(config: MetaAdsConfig, adAccountId: string) {
  return config.allowedAdAccountIds.length === 0 || config.allowedAdAccountIds.includes(adAccountId);
}

export function enforceBudgetGuards(config: MetaAdsConfig, value: unknown) {
  const violations: string[] = [];
  walkObject(value, (key, item) => {
    if (typeof item !== "number" || !Number.isFinite(item)) return;
    if (BUDGET_FIELD_PATTERN.test(key) && item > config.maxDailyBudgetCents) {
      violations.push(`${key} exceeds maxDailyBudgetCents (${item} > ${config.maxDailyBudgetCents})`);
    }
    if (PERCENT_FIELD_PATTERN.test(key) && Math.abs(item) > config.maxBudgetChangePercent) {
      violations.push(`${key} exceeds maxBudgetChangePercent (${item} > ${config.maxBudgetChangePercent})`);
    }
  });
  if (violations.length > 0) throw new Error(`Meta Ads budget guard blocked this action: ${violations.join("; ")}`);
}

export async function runMetaCommand(config: MetaAdsConfig, plan: MetaCommandPlan, payload?: unknown): Promise<MetaRunResult> {
  ensurePlanAllowed(config, plan, payload);
  const args = config.dryRun && plan.mutating && !plan.args.includes("--dry-run")
    ? [...plan.args, "--dry-run"]
    : plan.args;
  const effectiveDryRun = args.includes("--dry-run");
  const env = {
    ...process.env,
    ...(config.metaConfigDir ? { META_ADS_CLI_CONFIG_DIR: config.metaConfigDir } : {}),
  };

  let stdout = "";
  let stderr = "";
  let truncated = false;
  const child = spawn(config.metaCliBinaryPath, args, { env, stdio: ["ignore", "pipe", "pipe"] });
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

  return {
    command: config.metaCliBinaryPath,
    args,
    code,
    stdout,
    stderr,
    parsed: parseOutput(stdout),
    truncated,
    dryRun: effectiveDryRun,
  };
}

export function summarizeMetaResult(result: MetaRunResult) {
  if (result.code === 0) return result.parsed ?? result.stdout;
  const detail = result.stderr || result.stdout || `Meta CLI exited with code ${result.code}`;
  throw new Error(detail);
}

function assertSafeToken(value: string, label: string) {
  if (!value || SHELL_META_PATTERN.test(value)) {
    throw new Error(`Unsafe ${label}: ${value}`);
  }
}

function normalizeBinaryPath(value: unknown) {
  const raw = typeof value === "string" && value.trim() ? value.trim() : DEFAULT_CONFIG.metaCliBinaryPath;
  if (SHELL_META_PATTERN.test(raw)) return DEFAULT_CONFIG.metaCliBinaryPath;
  return raw;
}

function normalizeStringList(value: unknown, fallback: readonly string[]) {
  const source = Array.isArray(value) ? value : fallback;
  const items = source
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item && !SHELL_META_PATTERN.test(item));
  return items.length > 0 ? [...new Set(items)] : [...fallback];
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function walkObject(value: unknown, visitor: (key: string, value: unknown) => void, key = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkObject(item, visitor, `${key}.${index}`));
    return;
  }
  if (typeof value === "object" && value !== null) {
    for (const [childKey, childValue] of Object.entries(value)) {
      const nextKey = key ? `${key}.${childKey}` : childKey;
      visitor(nextKey, childValue);
      walkObject(childValue, visitor, nextKey);
    }
  }
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
