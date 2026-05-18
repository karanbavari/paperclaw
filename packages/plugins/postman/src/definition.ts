import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.postman",
  "packageName": "@kesarcloud/plugin-postman",
  "version": "0.1.0",
  "displayName": "Postman",
  "routePath": "postman",
  "description": "Connects PaperClaw agents to Postman for workspaces, collections, environments, APIs, monitors, mocks, and test runs.",
  "apiBaseUrl": "https://api.getpostman.com",
  "tokenLabel": "Postman API Key",
  "oauthLabel": "Postman OAuth",
  "connectedLabel": "Workspace ID",
  "authScheme": "api-key",
  "accessTokenHeaderName": "X-Api-Key",
  "defaultScopes": [
    "collections",
    "workspaces",
    "environments",
    "monitors"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "workspacesList",
      "displayName": "List Postman Workspaces",
      "description": "List workspaces.",
      "method": "GET",
      "path": "/workspaces",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "workspaceGet",
      "displayName": "Get Postman Workspace",
      "description": "Get a workspace.",
      "method": "GET",
      "path": "/workspaces/{workspaceId}",
      "mutating": false,
      "required": [
        "workspaceId"
      ],
      "queryParams": []
    },
    {
      "key": "collectionsList",
      "displayName": "List Postman Collections",
      "description": "List collections.",
      "method": "GET",
      "path": "/collections",
      "mutating": false,
      "required": [],
      "queryParams": [
        "workspace"
      ]
    },
    {
      "key": "collectionCreate",
      "displayName": "Create Postman Collection",
      "description": "Create a collection.",
      "method": "POST",
      "path": "/collections",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "collection"
    },
    {
      "key": "environmentsList",
      "displayName": "List Postman Environments",
      "description": "List environments.",
      "method": "GET",
      "path": "/environments",
      "mutating": false,
      "required": [],
      "queryParams": [
        "workspace"
      ]
    },
    {
      "key": "environmentCreate",
      "displayName": "Create Postman Environment",
      "description": "Create an environment.",
      "method": "POST",
      "path": "/environments",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "environment"
    },
    {
      "key": "monitorsList",
      "displayName": "List Postman Monitors",
      "description": "List monitors.",
      "method": "GET",
      "path": "/monitors",
      "mutating": false,
      "required": [],
      "queryParams": [
        "workspace"
      ]
    },
    {
      "key": "mockCreate",
      "displayName": "Create Postman Mock Server",
      "description": "Create a mock server.",
      "method": "POST",
      "path": "/mocks",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "mock"
    }
  ]
};
