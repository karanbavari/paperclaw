import type { PaperClawPluginManifestV1 } from "@kesarcloud/plugin-sdk";
import {
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
  displayName: "Appointment Booking",
  description: "Lets PaperClaw agents create, store, reschedule, and cancel Google Calendar-backed appointments.",
  author: "PaperClaw",
  categories: ["connector", "automation", "ui"],
  capabilities: [
    "http.outbound",
    "secrets.read-ref",
    "plugin.state.read",
    "plugin.state.write",
    "agent.tools.register",
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
      googleCalendarId: {
        type: "string",
        title: "Google Calendar ID",
        default: DEFAULT_CONFIG.googleCalendarId,
        description: "Calendar id to create events in, for example primary or team@example.com.",
      },
      googleAccessTokenSecretRef: {
        type: "string",
        title: "Google Access Token Secret Reference",
        default: DEFAULT_CONFIG.googleAccessTokenSecretRef,
        description: "PaperClaw secret reference containing a Google OAuth bearer token or service account access token.",
      },
      timezone: {
        type: "string",
        title: "Default Timezone",
        default: DEFAULT_CONFIG.timezone,
      },
      defaultDurationMinutes: {
        type: "number",
        title: "Default Duration Minutes",
        default: DEFAULT_CONFIG.defaultDurationMinutes,
        minimum: 5,
        maximum: 480,
      },
      dryRun: {
        type: "boolean",
        title: "Dry Run",
        default: DEFAULT_CONFIG.dryRun,
        description: "When enabled, mutating tools return the planned request without saving a booking or changing Google Calendar.",
      },
    },
  },
  tools: [
    {
      name: TOOL_NAMES.listUpcoming,
      displayName: "List Upcoming Appointments",
      description: "List upcoming appointments stored by PaperClaw.",
      parametersSchema: {
        type: "object",
        properties: {
          limit: { type: "number", minimum: 1, maximum: 50 },
        },
      },
    },
    {
      name: TOOL_NAMES.findAvailability,
      displayName: "Find Appointment Availability",
      description: "Find available appointment slots from Google Calendar free/busy data.",
      parametersSchema: {
        type: "object",
        properties: {
          serviceId: { type: "string" },
          providerId: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
          durationMinutes: { type: "number", minimum: 5, maximum: 480 },
        },
        required: ["serviceId", "from", "to"],
      },
    },
    {
      name: TOOL_NAMES.createBooking,
      displayName: "Create Booking",
      description: "Create a PaperClaw booking and sync it to Google Calendar.",
      parametersSchema: {
        type: "object",
        properties: {
          serviceId: { type: "string" },
          providerId: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
          customer: {
            type: "object",
            properties: {
              firstName: { type: "string" },
              lastName: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
            },
          },
          notes: { type: "string" },
        },
        required: ["serviceId", "start", "customer"],
      },
    },
    {
      name: TOOL_NAMES.rescheduleBooking,
      displayName: "Reschedule Booking",
      description: "Move an existing PaperClaw booking and Google Calendar event to a new time.",
      parametersSchema: {
        type: "object",
        properties: {
          appointmentId: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
        },
        required: ["appointmentId", "start"],
      },
    },
    {
      name: TOOL_NAMES.cancelBooking,
      displayName: "Cancel Booking",
      description: "Cancel a PaperClaw booking and remove its Google Calendar event.",
      parametersSchema: {
        type: "object",
        properties: {
          appointmentId: { type: "string" },
          reason: { type: "string" },
        },
        required: ["appointmentId"],
      },
    },
  ],
  ui: {
    slots: [
      {
        type: "page",
        id: SLOT_IDS.page,
        displayName: "Appointments",
        exportName: EXPORT_NAMES.page,
        routePath: PAGE_ROUTE,
      },
      {
        type: "settingsPage",
        id: SLOT_IDS.settingsPage,
        displayName: "Appointment Booking",
        exportName: EXPORT_NAMES.settingsPage,
      },
      {
        type: "dashboardWidget",
        id: SLOT_IDS.dashboardWidget,
        displayName: "Appointments",
        exportName: EXPORT_NAMES.dashboardWidget,
      },
    ],
  },
};

export default manifest;
