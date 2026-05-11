import type { PaperClawPluginManifestV1 } from "@kesarcloud/plugin-sdk";
import {
  DEFAULT_ALLOWED_SERVICES,
  DEFAULT_CONFIG,
  EXPORT_NAMES,
  PAGE_ROUTE,
  PLUGIN_ID,
  PLUGIN_VERSION,
  SLOT_IDS,
  TOOL_NAMES,
} from "./constants.js";

const manifest: PaperClawPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Google Workspace",
  description: "Connects PaperClaw agents to Gmail, Calendar, Drive, Docs, Sheets, Chat, and other Google Workspace APIs through the gws CLI.",
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
      gwsBinaryPath: {
        type: "string",
        title: "gws Binary Path",
        default: DEFAULT_CONFIG.gwsBinaryPath,
        description: "Path or executable name for the Google Workspace CLI.",
      },
      gwsConfigDir: {
        type: "string",
        title: "gws Config Directory",
        default: DEFAULT_CONFIG.gwsConfigDir,
        description: "Optional GOOGLE_WORKSPACE_CLI_CONFIG_DIR containing an authenticated gws profile.",
      },
      dryRun: {
        type: "boolean",
        title: "Dry Run",
        default: DEFAULT_CONFIG.dryRun,
        description: "When enabled, mutating tools preview the gws request with --dry-run.",
      },
      enableRawGwsTool: {
        type: "boolean",
        title: "Enable Raw gws Tool",
        default: DEFAULT_CONFIG.enableRawGwsTool,
        description: "Allows agents to call governed raw gws service/resource/method commands.",
      },
      allowedServices: {
        type: "array",
        title: "Allowed Services",
        default: DEFAULT_ALLOWED_SERVICES,
        items: { type: "string" },
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
      name: TOOL_NAMES.gmailSearch,
      displayName: "Gmail Search",
      description: "Search Gmail messages with a Gmail query.",
      parametersSchema: {
        type: "object",
        properties: { query: { type: "string" }, maxResults: { type: "number" } },
        required: ["query"],
      },
    },
    {
      name: TOOL_NAMES.gmailRead,
      displayName: "Gmail Read",
      description: "Read a Gmail message by id.",
      parametersSchema: {
        type: "object",
        properties: { messageId: { type: "string" }, format: { type: "string" } },
        required: ["messageId"],
      },
    },
    {
      name: TOOL_NAMES.gmailSend,
      displayName: "Gmail Send",
      description: "Send an email using gws Gmail helpers.",
      parametersSchema: {
        type: "object",
        properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" }, cc: { type: "string" } },
        required: ["to", "subject", "body"],
      },
    },
    {
      name: TOOL_NAMES.gmailReply,
      displayName: "Gmail Reply",
      description: "Reply to a Gmail thread/message using gws Gmail helpers.",
      parametersSchema: {
        type: "object",
        properties: { messageId: { type: "string" }, body: { type: "string" } },
        required: ["messageId", "body"],
      },
    },
    {
      name: TOOL_NAMES.calendarAgenda,
      displayName: "Calendar Agenda",
      description: "Load calendar agenda using gws Calendar helpers.",
      parametersSchema: { type: "object", properties: { calendarId: { type: "string" }, days: { type: "number" } } },
    },
    {
      name: TOOL_NAMES.calendarCreateEvent,
      displayName: "Calendar Create Event",
      description: "Create a Google Calendar event.",
      parametersSchema: {
        type: "object",
        properties: { calendarId: { type: "string" }, summary: { type: "string" }, start: { type: "string" }, end: { type: "string" }, description: { type: "string" } },
        required: ["summary", "start", "end"],
      },
    },
    {
      name: TOOL_NAMES.calendarUpdateEvent,
      displayName: "Calendar Update Event",
      description: "Patch a Google Calendar event.",
      parametersSchema: {
        type: "object",
        properties: { calendarId: { type: "string" }, eventId: { type: "string" }, patch: { type: "object" } },
        required: ["eventId", "patch"],
      },
    },
    {
      name: TOOL_NAMES.calendarDeleteEvent,
      displayName: "Calendar Delete Event",
      description: "Delete a Google Calendar event.",
      parametersSchema: {
        type: "object",
        properties: { calendarId: { type: "string" }, eventId: { type: "string" } },
        required: ["eventId"],
      },
    },
    {
      name: TOOL_NAMES.driveSearch,
      displayName: "Drive Search",
      description: "Search Google Drive files.",
      parametersSchema: { type: "object", properties: { query: { type: "string" }, pageSize: { type: "number" } }, required: ["query"] },
    },
    {
      name: TOOL_NAMES.driveUpload,
      displayName: "Drive Upload",
      description: "Upload a local file with gws Drive helpers.",
      parametersSchema: { type: "object", properties: { filePath: { type: "string" }, name: { type: "string" }, parentId: { type: "string" } }, required: ["filePath"] },
    },
    {
      name: TOOL_NAMES.driveShare,
      displayName: "Drive Share",
      description: "Create Drive file permissions.",
      parametersSchema: { type: "object", properties: { fileId: { type: "string" }, emailAddress: { type: "string" }, role: { type: "string" } }, required: ["fileId", "emailAddress"] },
    },
    {
      name: TOOL_NAMES.docsCreate,
      displayName: "Docs Create",
      description: "Create a Google Doc.",
      parametersSchema: { type: "object", properties: { title: { type: "string" } }, required: ["title"] },
    },
    {
      name: TOOL_NAMES.docsAppendText,
      displayName: "Docs Append Text",
      description: "Append text to a Google Doc.",
      parametersSchema: { type: "object", properties: { documentId: { type: "string" }, text: { type: "string" }, index: { type: "number" } }, required: ["documentId", "text"] },
    },
    {
      name: TOOL_NAMES.sheetsReadRange,
      displayName: "Sheets Read Range",
      description: "Read a Google Sheets range.",
      parametersSchema: { type: "object", properties: { spreadsheetId: { type: "string" }, range: { type: "string" } }, required: ["spreadsheetId", "range"] },
    },
    {
      name: TOOL_NAMES.sheetsAppendRows,
      displayName: "Sheets Append Rows",
      description: "Append rows to a Google Sheet.",
      parametersSchema: { type: "object", properties: { spreadsheetId: { type: "string" }, range: { type: "string" }, values: { type: "array" } }, required: ["spreadsheetId", "range", "values"] },
    },
    {
      name: TOOL_NAMES.chatSendMessage,
      displayName: "Chat Send Message",
      description: "Send a Google Chat message.",
      parametersSchema: { type: "object", properties: { parent: { type: "string" }, text: { type: "string" } }, required: ["parent", "text"] },
    },
    {
      name: TOOL_NAMES.runGwsCommand,
      displayName: "Run gws Command",
      description: "Run a governed raw gws service/resource/method command.",
      parametersSchema: {
        type: "object",
        properties: { service: { type: "string" }, resource: { type: "string" }, method: { type: "string" }, params: { type: "object" }, json: { type: "object" }, dryRun: { type: "boolean" } },
        required: ["service", "method"],
      },
    },
  ],
  ui: {
    slots: [
      { type: "page", id: SLOT_IDS.page, displayName: "Google Workspace", exportName: EXPORT_NAMES.page, routePath: PAGE_ROUTE },
      { type: "settingsPage", id: SLOT_IDS.settingsPage, displayName: "Google Workspace", exportName: EXPORT_NAMES.settingsPage },
      { type: "dashboardWidget", id: SLOT_IDS.dashboardWidget, displayName: "Google Workspace", exportName: EXPORT_NAMES.dashboardWidget },
    ],
  },
};

export default manifest;
