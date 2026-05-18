import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.appwrite",
  "packageName": "@kesarcloud/plugin-appwrite",
  "version": "0.1.0",
  "displayName": "Appwrite",
  "routePath": "appwrite",
  "description": "Connects PaperClaw agents to Appwrite for projects, databases, collections, documents, users, teams, functions, and storage.",
  "apiBaseUrl": "https://cloud.appwrite.io/v1",
  "tokenLabel": "Appwrite API Key",
  "oauthLabel": "Appwrite OAuth",
  "connectedLabel": "Project ID",
  "authScheme": "api-key",
  "accessTokenHeaderName": "X-Appwrite-Key",
  "connectedAccountHeaderName": "X-Appwrite-Project",
  "defaultScopes": [
    "databases.read",
    "databases.write",
    "users.read",
    "functions.read"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "databasesList",
      "displayName": "List Appwrite Databases",
      "description": "List databases.",
      "method": "GET",
      "path": "/databases",
      "mutating": false,
      "required": [],
      "queryParams": [
        "queries[]",
        "search"
      ]
    },
    {
      "key": "collectionsList",
      "displayName": "List Appwrite Collections",
      "description": "List collections.",
      "method": "GET",
      "path": "/databases/{databaseId}/collections",
      "mutating": false,
      "required": [
        "databaseId"
      ],
      "queryParams": [
        "queries[]",
        "search"
      ]
    },
    {
      "key": "documentsList",
      "displayName": "List Appwrite Documents",
      "description": "List documents.",
      "method": "GET",
      "path": "/databases/{databaseId}/collections/{collectionId}/documents",
      "mutating": false,
      "required": [
        "databaseId",
        "collectionId"
      ],
      "queryParams": [
        "queries[]"
      ]
    },
    {
      "key": "documentCreate",
      "displayName": "Create Appwrite Document",
      "description": "Create a document.",
      "method": "POST",
      "path": "/databases/{databaseId}/collections/{collectionId}/documents",
      "mutating": true,
      "required": [
        "databaseId",
        "collectionId"
      ],
      "queryParams": [],
      "bodyParam": "document"
    },
    {
      "key": "documentUpdate",
      "displayName": "Update Appwrite Document",
      "description": "Update a document.",
      "method": "PATCH",
      "path": "/databases/{databaseId}/collections/{collectionId}/documents/{documentId}",
      "mutating": true,
      "required": [
        "databaseId",
        "collectionId",
        "documentId"
      ],
      "queryParams": [],
      "bodyParam": "document"
    },
    {
      "key": "usersList",
      "displayName": "List Appwrite Users",
      "description": "List users.",
      "method": "GET",
      "path": "/users",
      "mutating": false,
      "required": [],
      "queryParams": [
        "queries[]",
        "search"
      ]
    },
    {
      "key": "functionsList",
      "displayName": "List Appwrite Functions",
      "description": "List functions.",
      "method": "GET",
      "path": "/functions",
      "mutating": false,
      "required": [],
      "queryParams": [
        "queries[]",
        "search"
      ]
    },
    {
      "key": "executionCreate",
      "displayName": "Create Appwrite Function Execution",
      "description": "Create a function execution.",
      "method": "POST",
      "path": "/functions/{functionId}/executions",
      "mutating": true,
      "required": [
        "functionId"
      ],
      "queryParams": [],
      "bodyParam": "execution"
    }
  ]
};
