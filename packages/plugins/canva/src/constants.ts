export const PLUGIN_ID = "paperclaw.canva";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "canva";

export const EXPORT_NAMES = {
  page: "CanvaPage",
  settingsPage: "CanvaSettingsPage",
  dashboardWidget: "CanvaDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "canva-page",
  settingsPage: "canva-settings-page",
  dashboardWidget: "canva-dashboard-widget",
} as const;

export const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const ACTION_KEYS = {
  startOauth: "start-oauth",
  saveClientSecret: "save-client-secret",
  completeOauth: "complete-oauth",
  disconnect: "disconnect",
} as const;

export const TOOL_NAMES = {
  getCurrentUser: "canva.getCurrentUser",
  getUserProfile: "canva.getUserProfile",
  getUserCapabilities: "canva.getUserCapabilities",
  listDesigns: "canva.listDesigns",
  getDesign: "canva.getDesign",
  createDesign: "canva.createDesign",
  getDesignPages: "canva.getDesignPages",
  getDesignExportFormats: "canva.getDesignExportFormats",
  createExportJob: "canva.createExportJob",
  getExportJob: "canva.getExportJob",
  getAsset: "canva.getAsset",
  uploadAssetFromUrl: "canva.uploadAssetFromUrl",
  uploadAssetBytes: "canva.uploadAssetBytes",
  updateAsset: "canva.updateAsset",
  deleteAsset: "canva.deleteAsset",
  listBrandTemplates: "canva.listBrandTemplates",
  getBrandTemplate: "canva.getBrandTemplate",
  getBrandTemplateDataset: "canva.getBrandTemplateDataset",
  createAutofillJob: "canva.createAutofillJob",
  getAutofillJob: "canva.getAutofillJob",
  createDesignImportJob: "canva.createDesignImportJob",
  getDesignImportJob: "canva.getDesignImportJob",
  createUrlImportJob: "canva.createUrlImportJob",
  getUrlImportJob: "canva.getUrlImportJob",
  createResizeJob: "canva.createResizeJob",
  getResizeJob: "canva.getResizeJob",
  createFolder: "canva.createFolder",
  getFolder: "canva.getFolder",
  updateFolder: "canva.updateFolder",
  deleteFolder: "canva.deleteFolder",
  listFolderItems: "canva.listFolderItems",
  moveFolderItem: "canva.moveFolderItem",
  createCommentThread: "canva.createCommentThread",
  listCommentReplies: "canva.listCommentReplies",
  createCommentReply: "canva.createCommentReply",
} as const;

export const DEFAULT_SCOPES = [
  "asset:read",
  "asset:write",
  "brandtemplate:meta:read",
  "brandtemplate:content:read",
  "comment:read",
  "comment:write",
  "design:meta:read",
  "design:content:read",
  "design:content:write",
  "folder:read",
  "folder:write",
  "profile:read",
] as const;

export const DEFAULT_CONFIG = {
  clientId: "",
  clientSecretRef: "",
  refreshTokenSecretRef: "",
  connectedCompanyId: "",
  connectedAt: "",
  connectedUserId: "",
  connectedDisplayName: "",
  redirectUri: "",
  enabledScopes: [...DEFAULT_SCOPES],
  dryRun: true,
  maxPollAttempts: 8,
  requestTimeoutMs: 30_000,
} as const;
