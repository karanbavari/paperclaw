import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.clio",
  packageName: "@kesarcloud/plugin-clio",
  version: "0.1.0",
  displayName: "Clio",
  routePath: "clio",
  description: "Connects PaperClaw agents to Clio Manage for contacts, matters, activities, tasks, documents, bills, and users.",
  apiBaseUrl: "https://app.clio.com/api/v4",
  authUrl: "https://app.clio.com/oauth/authorize",
  tokenUrl: "https://app.clio.com/oauth/token",
  tokenLabel: "Clio Access Token",
  oauthLabel: "Clio OAuth",
  connectedLabel: "Connected Clio Account",
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
      displayName: "List Clio Contacts",
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
      displayName: "Get Clio Contact",
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
      displayName: "Create Clio Contact",
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
      displayName: "List Clio Matters",
      description: "List matters.",
      method: "GET",
      path: "/matters",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "page",
        "query",
        "status"
      ]
    },
    {
      key: "matterGet",
      displayName: "Get Clio Matter",
      description: "Get a matter.",
      method: "GET",
      path: "/matters/{matterId}",
      mutating: false,
      required: [
        "matterId"
      ],
      queryParams: []
    },
    {
      key: "matterCreate",
      displayName: "Create Clio Matter",
      description: "Create a matter.",
      method: "POST",
      path: "/matters",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "matter"
    },
    {
      key: "tasksList",
      displayName: "List Clio Tasks",
      description: "List tasks.",
      method: "GET",
      path: "/tasks",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "page",
        "matter_id",
        "assignee_id"
      ]
    },
    {
      key: "taskCreate",
      displayName: "Create Clio Task",
      description: "Create a task.",
      method: "POST",
      path: "/tasks",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "task"
    },
    {
      key: "documentsList",
      displayName: "List Clio Documents",
      description: "List documents.",
      method: "GET",
      path: "/documents",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "page",
        "matter_id"
      ]
    },
    {
      key: "activitiesList",
      displayName: "List Clio Activities",
      description: "List activities/time entries.",
      method: "GET",
      path: "/activities",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "page",
        "matter_id"
      ]
    },
    {
      key: "activityCreate",
      displayName: "Create Clio Activity",
      description: "Create an activity/time entry.",
      method: "POST",
      path: "/activities",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "activity"
    },
    {
      key: "billsList",
      displayName: "List Clio Bills",
      description: "List bills.",
      method: "GET",
      path: "/bills",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "page",
        "matter_id"
      ]
    }
  ]
};
