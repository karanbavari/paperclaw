import type { PaperClawPluginManifestV1 } from "@kesarcloud/plugin-sdk";
import {
  DEFAULT_CONFIG,
  DEFAULT_SCOPES,
  EXPORT_NAMES,
  PAGE_ROUTE,
  PLUGIN_ID,
  PLUGIN_VERSION,
  SLOT_IDS,
  TOOL_NAMES,
} from "./constants.js";

const stringParam = { type: "string" } as const;
const numberParam = { type: "number" } as const;
const booleanParam = { type: "boolean" } as const;
const objectParam = { type: "object" } as const;
const arrayParam = { type: "array" } as const;

const objectParams = {
  objectType: stringParam,
  objectId: stringParam,
  properties: arrayParam,
  associations: arrayParam,
  archived: booleanParam,
  idProperty: stringParam,
} as const;

const recordBodyParams = {
  properties: objectParam,
  associations: arrayParam,
  idProperty: stringParam,
} as const;

const manifest: PaperClawPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "HubSpot",
  description: "Connects PaperClaw agents to HubSpot CRM APIs for records, search, batch operations, properties, associations, owners, and pipelines.",
  author: "PaperClaw",
  categories: ["connector", "automation", "workspace"],
  capabilities: [
    "http.outbound",
    "secrets.read-ref",
    "secrets.write-ref",
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
      authMode: {
        type: "string",
        title: "Auth Mode",
        default: DEFAULT_CONFIG.authMode,
        enum: ["private_token", "oauth"],
      },
      privateAccessTokenSecretRef: {
        type: "string",
        format: "secret-ref",
        title: "Private Access Token Reference",
        default: DEFAULT_CONFIG.privateAccessTokenSecretRef,
      },
      clientId: {
        type: "string",
        title: "HubSpot OAuth Client ID",
        default: DEFAULT_CONFIG.clientId,
      },
      clientSecretRef: {
        type: "string",
        format: "secret-ref",
        title: "HubSpot OAuth Client Secret Reference",
        default: DEFAULT_CONFIG.clientSecretRef,
      },
      refreshTokenSecretRef: {
        type: "string",
        format: "secret-ref",
        title: "HubSpot Refresh Token Reference",
        default: DEFAULT_CONFIG.refreshTokenSecretRef,
      },
      connectedCompanyId: {
        type: "string",
        title: "Connected Company ID",
        default: DEFAULT_CONFIG.connectedCompanyId,
      },
      connectedAt: {
        type: "string",
        title: "Connected At",
        default: DEFAULT_CONFIG.connectedAt,
      },
      portalId: {
        type: "string",
        title: "HubSpot Portal ID",
        default: DEFAULT_CONFIG.portalId,
      },
      redirectUri: {
        type: "string",
        title: "Redirect URI",
        default: DEFAULT_CONFIG.redirectUri,
      },
      enabledScopes: {
        type: "array",
        title: "OAuth Scopes",
        default: DEFAULT_CONFIG.enabledScopes,
        items: { type: "string", enum: [...DEFAULT_SCOPES] },
      },
      dryRun: {
        type: "boolean",
        title: "Dry Run",
        default: DEFAULT_CONFIG.dryRun,
      },
      enableRawApiTool: {
        type: "boolean",
        title: "Enable Raw API Tool",
        default: DEFAULT_CONFIG.enableRawApiTool,
      },
      requestTimeoutMs: {
        type: "number",
        title: "HTTP Timeout Milliseconds",
        default: DEFAULT_CONFIG.requestTimeoutMs,
        minimum: 5000,
        maximum: 120000,
      },
      maxOutputBytes: {
        type: "number",
        title: "Max Output Bytes",
        default: DEFAULT_CONFIG.maxOutputBytes,
        minimum: 4000,
        maximum: 500000,
      },
    },
  },
  tools: [
    { name: TOOL_NAMES.objectGet, displayName: "Get HubSpot Object", description: "Get a CRM object by type and ID.", parametersSchema: { type: "object", properties: objectParams, required: ["objectType", "objectId"] } },
    { name: TOOL_NAMES.objectList, displayName: "List HubSpot Objects", description: "List CRM objects by type.", parametersSchema: { type: "object", properties: { objectType: stringParam, limit: numberParam, after: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam }, required: ["objectType"] } },
    { name: TOOL_NAMES.objectSearch, displayName: "Search HubSpot Objects", description: "Search CRM objects by type.", parametersSchema: { type: "object", properties: { objectType: stringParam, filterGroups: arrayParam, sorts: arrayParam, properties: arrayParam, query: stringParam, limit: numberParam, after: stringParam }, required: ["objectType"] } },
    { name: TOOL_NAMES.objectCreate, displayName: "Create HubSpot Object", description: "Create a CRM object.", parametersSchema: { type: "object", properties: { objectType: stringParam, ...recordBodyParams }, required: ["objectType", "properties"] } },
    { name: TOOL_NAMES.objectUpdate, displayName: "Update HubSpot Object", description: "Update a CRM object.", parametersSchema: { type: "object", properties: { objectType: stringParam, objectId: stringParam, ...recordBodyParams }, required: ["objectType", "objectId", "properties"] } },
    { name: TOOL_NAMES.objectArchive, displayName: "Archive HubSpot Object", description: "Archive a CRM object.", parametersSchema: { type: "object", properties: { objectType: stringParam, objectId: stringParam }, required: ["objectType", "objectId"] } },
    { name: TOOL_NAMES.batchRead, displayName: "Batch Read HubSpot Objects", description: "Batch read CRM objects.", parametersSchema: { type: "object", properties: { objectType: stringParam, inputs: arrayParam, properties: arrayParam, idProperty: stringParam }, required: ["objectType", "inputs"] } },
    { name: TOOL_NAMES.batchCreate, displayName: "Batch Create HubSpot Objects", description: "Batch create CRM objects.", parametersSchema: { type: "object", properties: { objectType: stringParam, inputs: arrayParam }, required: ["objectType", "inputs"] } },
    { name: TOOL_NAMES.batchUpdate, displayName: "Batch Update HubSpot Objects", description: "Batch update CRM objects.", parametersSchema: { type: "object", properties: { objectType: stringParam, inputs: arrayParam }, required: ["objectType", "inputs"] } },
    { name: TOOL_NAMES.batchArchive, displayName: "Batch Archive HubSpot Objects", description: "Batch archive CRM objects.", parametersSchema: { type: "object", properties: { objectType: stringParam, inputs: arrayParam }, required: ["objectType", "inputs"] } },
    { name: TOOL_NAMES.contactsList, displayName: "List HubSpot Contacts", description: "List contacts.", parametersSchema: { type: "object", properties: { limit: numberParam, after: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam } } },
    { name: TOOL_NAMES.contactsSearch, displayName: "Search HubSpot Contacts", description: "Search contacts.", parametersSchema: { type: "object", properties: { filterGroups: arrayParam, sorts: arrayParam, properties: arrayParam, query: stringParam, limit: numberParam, after: stringParam } } },
    { name: TOOL_NAMES.contactGet, displayName: "Get HubSpot Contact", description: "Get a contact.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam, idProperty: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.contactCreate, displayName: "Create HubSpot Contact", description: "Create a contact.", parametersSchema: { type: "object", properties: recordBodyParams, required: ["properties"] } },
    { name: TOOL_NAMES.contactUpdate, displayName: "Update HubSpot Contact", description: "Update a contact.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: objectParam, idProperty: stringParam }, required: ["objectId", "properties"] } },
    { name: TOOL_NAMES.contactArchive, displayName: "Archive HubSpot Contact", description: "Archive a contact.", parametersSchema: { type: "object", properties: { objectId: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.companiesList, displayName: "List HubSpot Companies", description: "List companies.", parametersSchema: { type: "object", properties: { limit: numberParam, after: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam } } },
    { name: TOOL_NAMES.companiesSearch, displayName: "Search HubSpot Companies", description: "Search companies.", parametersSchema: { type: "object", properties: { filterGroups: arrayParam, sorts: arrayParam, properties: arrayParam, query: stringParam, limit: numberParam, after: stringParam } } },
    { name: TOOL_NAMES.companyGet, displayName: "Get HubSpot Company", description: "Get a company.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam, idProperty: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.companyCreate, displayName: "Create HubSpot Company", description: "Create a company.", parametersSchema: { type: "object", properties: recordBodyParams, required: ["properties"] } },
    { name: TOOL_NAMES.companyUpdate, displayName: "Update HubSpot Company", description: "Update a company.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: objectParam, idProperty: stringParam }, required: ["objectId", "properties"] } },
    { name: TOOL_NAMES.companyArchive, displayName: "Archive HubSpot Company", description: "Archive a company.", parametersSchema: { type: "object", properties: { objectId: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.dealsList, displayName: "List HubSpot Deals", description: "List deals.", parametersSchema: { type: "object", properties: { limit: numberParam, after: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam } } },
    { name: TOOL_NAMES.dealsSearch, displayName: "Search HubSpot Deals", description: "Search deals.", parametersSchema: { type: "object", properties: { filterGroups: arrayParam, sorts: arrayParam, properties: arrayParam, query: stringParam, limit: numberParam, after: stringParam } } },
    { name: TOOL_NAMES.dealGet, displayName: "Get HubSpot Deal", description: "Get a deal.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam, idProperty: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.dealCreate, displayName: "Create HubSpot Deal", description: "Create a deal.", parametersSchema: { type: "object", properties: recordBodyParams, required: ["properties"] } },
    { name: TOOL_NAMES.dealUpdate, displayName: "Update HubSpot Deal", description: "Update a deal.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: objectParam, idProperty: stringParam }, required: ["objectId", "properties"] } },
    { name: TOOL_NAMES.dealArchive, displayName: "Archive HubSpot Deal", description: "Archive a deal.", parametersSchema: { type: "object", properties: { objectId: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.ticketsList, displayName: "List HubSpot Tickets", description: "List tickets.", parametersSchema: { type: "object", properties: { limit: numberParam, after: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam } } },
    { name: TOOL_NAMES.ticketsSearch, displayName: "Search HubSpot Tickets", description: "Search tickets.", parametersSchema: { type: "object", properties: { filterGroups: arrayParam, sorts: arrayParam, properties: arrayParam, query: stringParam, limit: numberParam, after: stringParam } } },
    { name: TOOL_NAMES.ticketGet, displayName: "Get HubSpot Ticket", description: "Get a ticket.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: arrayParam, associations: arrayParam, archived: booleanParam, idProperty: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.ticketCreate, displayName: "Create HubSpot Ticket", description: "Create a ticket.", parametersSchema: { type: "object", properties: recordBodyParams, required: ["properties"] } },
    { name: TOOL_NAMES.ticketUpdate, displayName: "Update HubSpot Ticket", description: "Update a ticket.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: objectParam, idProperty: stringParam }, required: ["objectId", "properties"] } },
    { name: TOOL_NAMES.ticketArchive, displayName: "Archive HubSpot Ticket", description: "Archive a ticket.", parametersSchema: { type: "object", properties: { objectId: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.noteCreate, displayName: "Create HubSpot Note", description: "Create a note engagement.", parametersSchema: { type: "object", properties: recordBodyParams, required: ["properties"] } },
    { name: TOOL_NAMES.noteGet, displayName: "Get HubSpot Note", description: "Get a note.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: arrayParam, associations: arrayParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.noteUpdate, displayName: "Update HubSpot Note", description: "Update a note.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: objectParam }, required: ["objectId", "properties"] } },
    { name: TOOL_NAMES.noteArchive, displayName: "Archive HubSpot Note", description: "Archive a note.", parametersSchema: { type: "object", properties: { objectId: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.taskCreate, displayName: "Create HubSpot Task", description: "Create a task engagement.", parametersSchema: { type: "object", properties: recordBodyParams, required: ["properties"] } },
    { name: TOOL_NAMES.taskGet, displayName: "Get HubSpot Task", description: "Get a task.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: arrayParam, associations: arrayParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.taskUpdate, displayName: "Update HubSpot Task", description: "Update a task.", parametersSchema: { type: "object", properties: { objectId: stringParam, properties: objectParam }, required: ["objectId", "properties"] } },
    { name: TOOL_NAMES.taskArchive, displayName: "Archive HubSpot Task", description: "Archive a task.", parametersSchema: { type: "object", properties: { objectId: stringParam }, required: ["objectId"] } },
    { name: TOOL_NAMES.propertiesList, displayName: "List HubSpot Properties", description: "List CRM properties for an object type.", parametersSchema: { type: "object", properties: { objectType: stringParam, archived: booleanParam }, required: ["objectType"] } },
    { name: TOOL_NAMES.propertyGet, displayName: "Get HubSpot Property", description: "Get a CRM property.", parametersSchema: { type: "object", properties: { objectType: stringParam, propertyName: stringParam, archived: booleanParam }, required: ["objectType", "propertyName"] } },
    { name: TOOL_NAMES.propertyCreate, displayName: "Create HubSpot Property", description: "Create a CRM property.", parametersSchema: { type: "object", properties: { objectType: stringParam, property: objectParam }, required: ["objectType", "property"] } },
    { name: TOOL_NAMES.propertyUpdate, displayName: "Update HubSpot Property", description: "Update a CRM property.", parametersSchema: { type: "object", properties: { objectType: stringParam, propertyName: stringParam, patch: objectParam }, required: ["objectType", "propertyName", "patch"] } },
    { name: TOOL_NAMES.ownersList, displayName: "List HubSpot Owners", description: "List HubSpot owners.", parametersSchema: { type: "object", properties: { email: stringParam, after: stringParam, limit: numberParam, archived: booleanParam } } },
    { name: TOOL_NAMES.pipelinesList, displayName: "List HubSpot Pipelines", description: "List pipelines for an object type.", parametersSchema: { type: "object", properties: { objectType: stringParam }, required: ["objectType"] } },
    { name: TOOL_NAMES.pipelineGet, displayName: "Get HubSpot Pipeline", description: "Get a pipeline.", parametersSchema: { type: "object", properties: { objectType: stringParam, pipelineId: stringParam }, required: ["objectType", "pipelineId"] } },
    { name: TOOL_NAMES.associationsList, displayName: "List HubSpot Associations", description: "List associations between records.", parametersSchema: { type: "object", properties: { fromObjectType: stringParam, fromObjectId: stringParam, toObjectType: stringParam, after: stringParam, limit: numberParam }, required: ["fromObjectType", "fromObjectId", "toObjectType"] } },
    { name: TOOL_NAMES.associationCreateDefault, displayName: "Create Default HubSpot Association", description: "Create a default association.", parametersSchema: { type: "object", properties: { fromObjectType: stringParam, fromObjectId: stringParam, toObjectType: stringParam, toObjectId: stringParam }, required: ["fromObjectType", "fromObjectId", "toObjectType", "toObjectId"] } },
    { name: TOOL_NAMES.associationCreateLabeled, displayName: "Create Labeled HubSpot Association", description: "Create a labeled association.", parametersSchema: { type: "object", properties: { fromObjectType: stringParam, fromObjectId: stringParam, toObjectType: stringParam, toObjectId: stringParam, associationTypes: arrayParam }, required: ["fromObjectType", "fromObjectId", "toObjectType", "toObjectId", "associationTypes"] } },
    { name: TOOL_NAMES.associationRemove, displayName: "Remove HubSpot Association", description: "Remove an association.", parametersSchema: { type: "object", properties: { fromObjectType: stringParam, fromObjectId: stringParam, toObjectType: stringParam, toObjectId: stringParam }, required: ["fromObjectType", "fromObjectId", "toObjectType", "toObjectId"] } },
    { name: TOOL_NAMES.apiRequest, displayName: "HubSpot CRM API Request", description: "Run a guarded HubSpot API request. Disabled by default.", parametersSchema: { type: "object", properties: { method: stringParam, path: stringParam, query: objectParam, body: objectParam }, required: ["method", "path"] } },
  ],
  ui: {
    slots: [
      { type: "page", id: SLOT_IDS.page, displayName: "HubSpot", exportName: EXPORT_NAMES.page, routePath: PAGE_ROUTE, order: 60 },
      { type: "settingsPage", id: SLOT_IDS.settingsPage, displayName: "HubSpot", exportName: EXPORT_NAMES.settingsPage, order: 60 },
      { type: "dashboardWidget", id: SLOT_IDS.dashboardWidget, displayName: "HubSpot", exportName: EXPORT_NAMES.dashboardWidget, order: 60 },
    ],
    launchers: [
      {
        id: "hubspot-page",
        displayName: "HubSpot",
        placementZone: "sidebar",
        action: { type: "navigate", target: PAGE_ROUTE },
      },
    ],
  },
};

export default manifest;
