import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.figma",
  "packageName": "@kesarcloud/plugin-figma",
  "version": "0.1.0",
  "displayName": "Figma",
  "routePath": "figma",
  "description": "Connects PaperClaw agents to Figma for files, projects, comments, components, styles, variables, dev resources, and webhooks.",
  "apiBaseUrl": "https://api.figma.com",
  "authUrl": "https://www.figma.com/oauth",
  "tokenUrl": "https://api.figma.com/v1/oauth/token",
  "tokenLabel": "Figma Personal Access Token",
  "oauthLabel": "Figma OAuth",
  "connectedLabel": "Team or File Key",
  "defaultScopes": [
    "file_read",
    "file_write"
  ],
  "rawPathPrefixes": [
    "/v1/",
    "/v2/"
  ],
  "endpoints": [
    {
      "key": "fileGet",
      "displayName": "Get Figma File",
      "description": "Get a file document.",
      "method": "GET",
      "path": "/v1/files/{fileKey}",
      "mutating": false,
      "required": [
        "fileKey"
      ],
      "queryParams": [
        "ids",
        "depth",
        "geometry",
        "plugin_data"
      ]
    },
    {
      "key": "fileNodesGet",
      "displayName": "Get Figma File Nodes",
      "description": "Get specific file nodes.",
      "method": "GET",
      "path": "/v1/files/{fileKey}/nodes",
      "mutating": false,
      "required": [
        "fileKey"
      ],
      "queryParams": [
        "ids",
        "depth",
        "geometry"
      ]
    },
    {
      "key": "commentsList",
      "displayName": "List Figma Comments",
      "description": "List comments on a file.",
      "method": "GET",
      "path": "/v1/files/{fileKey}/comments",
      "mutating": false,
      "required": [
        "fileKey"
      ],
      "queryParams": []
    },
    {
      "key": "commentCreate",
      "displayName": "Create Figma Comment",
      "description": "Create a file comment.",
      "method": "POST",
      "path": "/v1/files/{fileKey}/comments",
      "mutating": true,
      "required": [
        "fileKey"
      ],
      "queryParams": [],
      "bodyParam": "comment"
    },
    {
      "key": "teamProjectsList",
      "displayName": "List Figma Team Projects",
      "description": "List team projects.",
      "method": "GET",
      "path": "/v1/teams/{teamId}/projects",
      "mutating": false,
      "required": [
        "teamId"
      ],
      "queryParams": []
    },
    {
      "key": "projectFilesList",
      "displayName": "List Figma Project Files",
      "description": "List project files.",
      "method": "GET",
      "path": "/v1/projects/{projectId}/files",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": [
        "branch_data"
      ]
    },
    {
      "key": "componentsList",
      "displayName": "List Figma File Components",
      "description": "List file components.",
      "method": "GET",
      "path": "/v1/files/{fileKey}/components",
      "mutating": false,
      "required": [
        "fileKey"
      ],
      "queryParams": []
    },
    {
      "key": "variablesLocalGet",
      "displayName": "Get Figma Local Variables",
      "description": "Get local variables.",
      "method": "GET",
      "path": "/v1/files/{fileKey}/variables/local",
      "mutating": false,
      "required": [
        "fileKey"
      ],
      "queryParams": []
    },
    {
      "key": "devResourcesCreate",
      "displayName": "Create Figma Dev Resources",
      "description": "Attach dev resources to nodes.",
      "method": "POST",
      "path": "/v1/dev_resources",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "devResources"
    }
  ]
};
