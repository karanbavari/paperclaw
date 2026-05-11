export const PLUGIN_ID = "paperclaw.google-workspace";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "google-workspace";

export const EXPORT_NAMES = {
  page: "GoogleWorkspacePage",
  settingsPage: "GoogleWorkspaceSettingsPage",
  dashboardWidget: "GoogleWorkspaceDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "google-workspace-page",
  settingsPage: "google-workspace-settings-page",
  dashboardWidget: "google-workspace-dashboard-widget",
} as const;

export const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const TOOL_NAMES = {
  gmailSearch: "gmail.search",
  gmailRead: "gmail.read",
  gmailSend: "gmail.send",
  gmailReply: "gmail.reply",
  calendarAgenda: "calendar.agenda",
  calendarCreateEvent: "calendar.createEvent",
  calendarUpdateEvent: "calendar.updateEvent",
  calendarDeleteEvent: "calendar.deleteEvent",
  driveSearch: "drive.search",
  driveUpload: "drive.upload",
  driveShare: "drive.share",
  docsCreate: "docs.create",
  docsAppendText: "docs.appendText",
  sheetsReadRange: "sheets.readRange",
  sheetsAppendRows: "sheets.appendRows",
  chatSendMessage: "chat.sendMessage",
  runGwsCommand: "workspace.runGwsCommand",
} as const;

export const DEFAULT_ALLOWED_SERVICES = [
  "gmail",
  "calendar",
  "drive",
  "docs",
  "sheets",
  "chat",
] as const;

export const DEFAULT_CONFIG = {
  gwsBinaryPath: "gws",
  gwsConfigDir: "",
  dryRun: true,
  enableRawGwsTool: false,
  allowedServices: [...DEFAULT_ALLOWED_SERVICES],
  maxOutputBytes: 32_000,
  timeoutMs: 30_000,
} as const;
