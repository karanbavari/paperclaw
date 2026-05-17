import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.filevine",
  packageName: "@kesarcloud/plugin-filevine",
  version: "0.1.0",
  displayName: "Filevine",
  routePath: "filevine",
  description: "Connects PaperClaw agents to Filevine for projects, contacts, tasks, notes, documents, collections, and search workflows.",
  apiBaseUrl: "https://api.filevine.io/v2",
  tokenUrl: "https://auth.filevine.io/connect/token",
  tokenLabel: "Filevine API Access Token",
  oauthLabel: "Filevine OAuth",
  connectedLabel: "Connected Org/Project",
  defaultScopes: [
    "fv.api"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "projectsList",
      displayName: "List Filevine Projects",
      description: "List projects.",
      method: "GET",
      path: "/core/projects",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "offset",
        "searchTerm"
      ]
    },
    {
      key: "projectGet",
      displayName: "Get Filevine Project",
      description: "Get a project.",
      method: "GET",
      path: "/core/projects/{projectId}",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: []
    },
    {
      key: "projectCreate",
      displayName: "Create Filevine Project",
      description: "Create a project.",
      method: "POST",
      path: "/core/projects",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "project"
    },
    {
      key: "contactsList",
      displayName: "List Filevine Contacts",
      description: "List contacts.",
      method: "GET",
      path: "/core/contacts",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "offset",
        "searchTerm"
      ]
    },
    {
      key: "contactCreate",
      displayName: "Create Filevine Contact",
      description: "Create a contact.",
      method: "POST",
      path: "/core/contacts",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "contact"
    },
    {
      key: "tasksList",
      displayName: "List Filevine Tasks",
      description: "List project tasks.",
      method: "GET",
      path: "/core/projects/{projectId}/tasks",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: [
        "limit",
        "offset"
      ]
    },
    {
      key: "taskCreate",
      displayName: "Create Filevine Task",
      description: "Create a task.",
      method: "POST",
      path: "/core/projects/{projectId}/tasks",
      mutating: true,
      required: [
        "projectId"
      ],
      queryParams: [],
      bodyParam: "task"
    },
    {
      key: "notesList",
      displayName: "List Filevine Notes",
      description: "List project notes.",
      method: "GET",
      path: "/core/projects/{projectId}/notes",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: [
        "limit",
        "offset"
      ]
    },
    {
      key: "noteCreate",
      displayName: "Create Filevine Note",
      description: "Create a note.",
      method: "POST",
      path: "/core/projects/{projectId}/notes",
      mutating: true,
      required: [
        "projectId"
      ],
      queryParams: [],
      bodyParam: "note"
    },
    {
      key: "documentsList",
      displayName: "List Filevine Documents",
      description: "List project documents.",
      method: "GET",
      path: "/core/projects/{projectId}/documents",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: [
        "limit",
        "offset"
      ]
    },
    {
      key: "collectionsList",
      displayName: "List Filevine Collections",
      description: "List project collections/fields.",
      method: "GET",
      path: "/core/projects/{projectId}/collections",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: []
    }
  ]
};
