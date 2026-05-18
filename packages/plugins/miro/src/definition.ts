import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.miro",
  "packageName": "@kesarcloud/plugin-miro",
  "version": "0.1.0",
  "displayName": "Miro",
  "routePath": "miro",
  "description": "Connects PaperClaw agents to Miro for boards, board items, frames, comments, tags, and collaborative design planning.",
  "apiBaseUrl": "https://api.miro.com",
  "authUrl": "https://miro.com/oauth/authorize",
  "tokenUrl": "https://api.miro.com/v1/oauth/token",
  "tokenLabel": "Miro Access Token",
  "oauthLabel": "Miro OAuth",
  "connectedLabel": "Team or Board ID",
  "defaultScopes": [
    "boards:read",
    "boards:write",
    "identity:read"
  ],
  "rawPathPrefixes": [
    "/v1/",
    "/v2/"
  ],
  "endpoints": [
    {
      "key": "boardsList",
      "displayName": "List Miro Boards",
      "description": "List boards.",
      "method": "GET",
      "path": "/v2/boards",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "cursor",
        "query"
      ]
    },
    {
      "key": "boardGet",
      "displayName": "Get Miro Board",
      "description": "Get a board.",
      "method": "GET",
      "path": "/v2/boards/{boardId}",
      "mutating": false,
      "required": [
        "boardId"
      ],
      "queryParams": []
    },
    {
      "key": "itemsList",
      "displayName": "List Miro Board Items",
      "description": "List board items.",
      "method": "GET",
      "path": "/v2/boards/{boardId}/items",
      "mutating": false,
      "required": [
        "boardId"
      ],
      "queryParams": [
        "limit",
        "cursor",
        "type"
      ]
    },
    {
      "key": "stickyNoteCreate",
      "displayName": "Create Miro Sticky Note",
      "description": "Create a sticky note.",
      "method": "POST",
      "path": "/v2/boards/{boardId}/sticky_notes",
      "mutating": true,
      "required": [
        "boardId"
      ],
      "queryParams": [],
      "bodyParam": "stickyNote"
    },
    {
      "key": "shapeCreate",
      "displayName": "Create Miro Shape",
      "description": "Create a shape.",
      "method": "POST",
      "path": "/v2/boards/{boardId}/shapes",
      "mutating": true,
      "required": [
        "boardId"
      ],
      "queryParams": [],
      "bodyParam": "shape"
    },
    {
      "key": "commentsList",
      "displayName": "List Miro Comments",
      "description": "List board comments.",
      "method": "GET",
      "path": "/v2/boards/{boardId}/comments",
      "mutating": false,
      "required": [
        "boardId"
      ],
      "queryParams": [
        "limit",
        "cursor"
      ]
    },
    {
      "key": "commentCreate",
      "displayName": "Create Miro Comment",
      "description": "Create a board comment.",
      "method": "POST",
      "path": "/v2/boards/{boardId}/comments",
      "mutating": true,
      "required": [
        "boardId"
      ],
      "queryParams": [],
      "bodyParam": "comment"
    },
    {
      "key": "tagsList",
      "displayName": "List Miro Tags",
      "description": "List board tags.",
      "method": "GET",
      "path": "/v2/boards/{boardId}/tags",
      "mutating": false,
      "required": [
        "boardId"
      ],
      "queryParams": []
    }
  ]
};
