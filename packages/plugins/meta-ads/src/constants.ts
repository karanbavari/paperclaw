export const PLUGIN_ID = "paperclaw.meta-ads";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "meta-ads";

export const EXPORT_NAMES = {
  page: "MetaAdsPage",
  settingsPage: "MetaAdsSettingsPage",
  dashboardWidget: "MetaAdsDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "meta-ads-page",
  settingsPage: "meta-ads-settings-page",
  dashboardWidget: "meta-ads-dashboard-widget",
} as const;

export const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const TOOL_NAMES = {
  accountOverview: "metaAds.accountOverview",
  campaignsList: "metaAds.campaignsList",
  campaignCreate: "metaAds.campaignCreate",
  campaignUpdate: "metaAds.campaignUpdate",
  adSetsList: "metaAds.adSetsList",
  adSetUpdate: "metaAds.adSetUpdate",
  adsList: "metaAds.adsList",
  adUpdate: "metaAds.adUpdate",
  insightsReport: "metaAds.insightsReport",
  creativeFatigueAudit: "metaAds.creativeFatigueAudit",
  catalogList: "metaAds.catalogList",
  catalogDiagnostics: "metaAds.catalogDiagnostics",
  signalDiagnostics: "metaAds.signalDiagnostics",
  runCliCommand: "metaAds.runCliCommand",
} as const;

export const DEFAULT_ALLOWED_OPERATIONS = [
  "read",
  "create",
  "update",
  "diagnostics",
] as const;

export const DEFAULT_CONFIG = {
  metaCliBinaryPath: "meta",
  metaConfigDir: "",
  dryRun: true,
  enableRawMetaTool: false,
  allowedOperations: [...DEFAULT_ALLOWED_OPERATIONS],
  allowedAdAccountIds: [] as string[],
  maxBudgetChangePercent: 25,
  maxDailyBudgetCents: 50_000,
  maxOutputBytes: 32_000,
  timeoutMs: 30_000,
} as const;
