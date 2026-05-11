import type { PaperClawPluginManifestV1 } from "@kesarcloud/plugin-sdk";
import {
  DEFAULT_ALLOWED_OPERATIONS,
  DEFAULT_CONFIG,
  EXPORT_NAMES,
  PAGE_ROUTE,
  PLUGIN_ID,
  PLUGIN_VERSION,
  SLOT_IDS,
  TOOL_NAMES,
} from "./constants.js";

const adAccountProperty = {
  type: "string",
  title: "Meta Ad Account ID",
  description: "Meta ad account id, for example act_123456789.",
} as const;

const manifest: PaperClawPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Meta Ads",
  description: "Connects PaperClaw agents to Meta Ads AI Connectors through the official Meta Ads CLI/MCP surface.",
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
      metaCliBinaryPath: {
        type: "string",
        title: "Meta CLI Binary Path",
        default: DEFAULT_CONFIG.metaCliBinaryPath,
        description: "Path or executable name for Meta's Ads AI Connector CLI.",
      },
      metaConfigDir: {
        type: "string",
        title: "Meta CLI Config Directory",
        default: DEFAULT_CONFIG.metaConfigDir,
        description: "Optional config directory for an authenticated Meta Ads CLI profile.",
      },
      dryRun: {
        type: "boolean",
        title: "Dry Run",
        default: DEFAULT_CONFIG.dryRun,
        description: "When enabled, mutating campaign tools preview commands instead of changing live ads.",
      },
      enableRawMetaTool: {
        type: "boolean",
        title: "Enable Raw Meta CLI Tool",
        default: DEFAULT_CONFIG.enableRawMetaTool,
        description: "Allows agents to run governed raw Meta CLI argument arrays.",
      },
      allowedOperations: {
        type: "array",
        title: "Allowed Operations",
        default: DEFAULT_ALLOWED_OPERATIONS,
        items: { type: "string" },
      },
      allowedAdAccountIds: {
        type: "array",
        title: "Allowed Ad Account IDs",
        default: DEFAULT_CONFIG.allowedAdAccountIds,
        items: { type: "string" },
        description: "Optional allowlist such as act_123. Empty means every account available to the CLI profile.",
      },
      maxBudgetChangePercent: {
        type: "number",
        title: "Max Budget Change Percent",
        default: DEFAULT_CONFIG.maxBudgetChangePercent,
        minimum: 0,
        maximum: 100,
      },
      maxDailyBudgetCents: {
        type: "number",
        title: "Max Daily Budget Cents",
        default: DEFAULT_CONFIG.maxDailyBudgetCents,
        minimum: 0,
        maximum: 50000000,
      },
      maxOutputBytes: {
        type: "number",
        title: "Max Output Bytes",
        default: DEFAULT_CONFIG.maxOutputBytes,
        minimum: 4000,
        maximum: 500000,
      },
      timeoutMs: {
        type: "number",
        title: "Command Timeout Milliseconds",
        default: DEFAULT_CONFIG.timeoutMs,
        minimum: 5000,
        maximum: 120000,
      },
    },
  },
  tools: [
    {
      name: TOOL_NAMES.accountOverview,
      displayName: "Meta Ads Account Overview",
      description: "Load account-level Meta Ads summary, permissions, spend status, and connector availability.",
      parametersSchema: { type: "object", properties: { adAccountId: adAccountProperty }, required: ["adAccountId"] },
    },
    {
      name: TOOL_NAMES.campaignsList,
      displayName: "List Campaigns",
      description: "List Meta Ads campaigns with optional status filtering.",
      parametersSchema: {
        type: "object",
        properties: { adAccountId: adAccountProperty, status: { type: "string" }, limit: { type: "number" } },
        required: ["adAccountId"],
      },
    },
    {
      name: TOOL_NAMES.campaignCreate,
      displayName: "Create Campaign",
      description: "Create a Meta Ads campaign. Dry run is enabled by default.",
      parametersSchema: {
        type: "object",
        properties: { adAccountId: adAccountProperty, campaign: { type: "object" } },
        required: ["adAccountId", "campaign"],
      },
    },
    {
      name: TOOL_NAMES.campaignUpdate,
      displayName: "Update Campaign",
      description: "Update campaign status, budget, bid strategy, or naming fields.",
      parametersSchema: {
        type: "object",
        properties: { adAccountId: adAccountProperty, campaignId: { type: "string" }, patch: { type: "object" } },
        required: ["adAccountId", "campaignId", "patch"],
      },
    },
    {
      name: TOOL_NAMES.adSetsList,
      displayName: "List Ad Sets",
      description: "List ad sets for an account or campaign.",
      parametersSchema: {
        type: "object",
        properties: { adAccountId: adAccountProperty, campaignId: { type: "string" }, status: { type: "string" }, limit: { type: "number" } },
        required: ["adAccountId"],
      },
    },
    {
      name: TOOL_NAMES.adSetUpdate,
      displayName: "Update Ad Set",
      description: "Update an ad set's status, budget, schedule, bid, or targeting fields.",
      parametersSchema: {
        type: "object",
        properties: { adAccountId: adAccountProperty, adSetId: { type: "string" }, patch: { type: "object" } },
        required: ["adAccountId", "adSetId", "patch"],
      },
    },
    {
      name: TOOL_NAMES.adsList,
      displayName: "List Ads",
      description: "List ads for an account, campaign, or ad set.",
      parametersSchema: {
        type: "object",
        properties: { adAccountId: adAccountProperty, campaignId: { type: "string" }, adSetId: { type: "string" }, status: { type: "string" }, limit: { type: "number" } },
        required: ["adAccountId"],
      },
    },
    {
      name: TOOL_NAMES.adUpdate,
      displayName: "Update Ad",
      description: "Update an ad's status, creative reference, or delivery settings.",
      parametersSchema: {
        type: "object",
        properties: { adAccountId: adAccountProperty, adId: { type: "string" }, patch: { type: "object" } },
        required: ["adAccountId", "adId", "patch"],
      },
    },
    {
      name: TOOL_NAMES.insightsReport,
      displayName: "Insights Report",
      description: "Run a Meta Ads insights report for account, campaign, ad set, or ad level.",
      parametersSchema: {
        type: "object",
        properties: { adAccountId: adAccountProperty, level: { type: "string" }, since: { type: "string" }, until: { type: "string" }, fields: { type: "array" }, breakdowns: { type: "array" } },
        required: ["adAccountId"],
      },
    },
    {
      name: TOOL_NAMES.creativeFatigueAudit,
      displayName: "Creative Fatigue Audit",
      description: "Run diagnostics for creative fatigue and performance decay.",
      parametersSchema: { type: "object", properties: { adAccountId: adAccountProperty, since: { type: "string" }, until: { type: "string" } }, required: ["adAccountId"] },
    },
    {
      name: TOOL_NAMES.catalogList,
      displayName: "List Catalogs",
      description: "List Meta Commerce catalogs for a Business Manager account.",
      parametersSchema: { type: "object", properties: { businessId: { type: "string" }, limit: { type: "number" } }, required: ["businessId"] },
    },
    {
      name: TOOL_NAMES.catalogDiagnostics,
      displayName: "Catalog Diagnostics",
      description: "Run product catalog diagnostics for feed health and item eligibility.",
      parametersSchema: { type: "object", properties: { catalogId: { type: "string" } }, required: ["catalogId"] },
    },
    {
      name: TOOL_NAMES.signalDiagnostics,
      displayName: "Signal Diagnostics",
      description: "Run Pixel, CAPI, event match quality, and signal health diagnostics.",
      parametersSchema: { type: "object", properties: { adAccountId: adAccountProperty, pixelId: { type: "string" } }, required: ["adAccountId"] },
    },
    {
      name: TOOL_NAMES.runCliCommand,
      displayName: "Run Meta CLI Command",
      description: "Run a governed raw Meta CLI argument array. Disabled by default.",
      parametersSchema: {
        type: "object",
        properties: { args: { type: "array" }, operation: { type: "string" }, adAccountId: adAccountProperty, dryRun: { type: "boolean" }, summary: { type: "string" } },
        required: ["args"],
      },
    },
  ],
  ui: {
    slots: [
      { type: "page", id: SLOT_IDS.page, displayName: "Meta Ads", exportName: EXPORT_NAMES.page, routePath: PAGE_ROUTE },
      { type: "settingsPage", id: SLOT_IDS.settingsPage, displayName: "Meta Ads", exportName: EXPORT_NAMES.settingsPage },
      { type: "dashboardWidget", id: SLOT_IDS.dashboardWidget, displayName: "Meta Ads", exportName: EXPORT_NAMES.dashboardWidget },
    ],
  },
};

export default manifest;
