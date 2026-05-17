import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.lawmatics",
  packageName: "@kesarcloud/plugin-lawmatics",
  version: "0.1.0",
  displayName: "Lawmatics",
  routePath: "lawmatics",
  description: "Connects PaperClaw agents to Lawmatics for contacts, matters/cases, automations, forms, events, tasks, and notes.",
  apiBaseUrl: "https://api.lawmatics.com/v1",
  tokenLabel: "Lawmatics API Key",
  oauthLabel: "Lawmatics OAuth",
  connectedLabel: "Connected Lawmatics Account",
  defaultScopes: [
    "read",
    "write"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "contactsList",
      displayName: "List Lawmatics Contacts",
      description: "List contacts.",
      method: "GET",
      path: "/contacts",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "page",
        "query"
      ]
    },
    {
      key: "contactGet",
      displayName: "Get Lawmatics Contact",
      description: "Get a contact.",
      method: "GET",
      path: "/contacts/{contactId}",
      mutating: false,
      required: [
        "contactId"
      ],
      queryParams: []
    },
    {
      key: "contactCreate",
      displayName: "Create Lawmatics Contact",
      description: "Create a contact.",
      method: "POST",
      path: "/contacts",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "contact"
    },
    {
      key: "mattersList",
      displayName: "List Lawmatics Matters",
      description: "List matters/cases.",
      method: "GET",
      path: "/matters",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "page",
        "status",
        "query"
      ]
    },
    {
      key: "matterCreate",
      displayName: "Create Lawmatics Matter",
      description: "Create a matter/case.",
      method: "POST",
      path: "/matters",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "matter"
    },
    {
      key: "tasksList",
      displayName: "List Lawmatics Tasks",
      description: "List tasks.",
      method: "GET",
      path: "/tasks",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "page",
        "contact_id",
        "matter_id"
      ]
    },
    {
      key: "taskCreate",
      displayName: "Create Lawmatics Task",
      description: "Create a task.",
      method: "POST",
      path: "/tasks",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "task"
    },
    {
      key: "notesList",
      displayName: "List Lawmatics Notes",
      description: "List notes.",
      method: "GET",
      path: "/notes",
      mutating: false,
      required: [],
      queryParams: [
        "contact_id",
        "matter_id"
      ]
    },
    {
      key: "noteCreate",
      displayName: "Create Lawmatics Note",
      description: "Create a note.",
      method: "POST",
      path: "/notes",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "note"
    },
    {
      key: "formsList",
      displayName: "List Lawmatics Forms",
      description: "List forms.",
      method: "GET",
      path: "/forms",
      mutating: false,
      required: [],
      queryParams: []
    },
    {
      key: "eventsList",
      displayName: "List Lawmatics Events",
      description: "List events.",
      method: "GET",
      path: "/events",
      mutating: false,
      required: [],
      queryParams: [
        "start_date",
        "end_date"
      ]
    },
    {
      key: "automationsList",
      displayName: "List Lawmatics Automations",
      description: "List automations.",
      method: "GET",
      path: "/automations",
      mutating: false,
      required: [],
      queryParams: []
    }
  ]
};
