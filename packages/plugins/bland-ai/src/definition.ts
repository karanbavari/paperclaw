import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.bland-ai",
  "packageName": "@kesarcloud/plugin-bland-ai",
  "version": "0.1.0",
  "displayName": "Bland AI",
  "routePath": "bland-ai",
  "description": "Connects PaperClaw agents to Bland AI for AI phone calls, pathways, campaigns, phone numbers, transcripts, and call analysis.",
  "apiBaseUrl": "https://api.bland.ai",
  "tokenLabel": "Bland AI API Key",
  "oauthLabel": "Bland AI OAuth",
  "connectedLabel": "Connected Bland AI Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "callCreate",
      "displayName": "Create Bland Call",
      "description": "Prepare outbound AI call request.",
      "method": "POST",
      "path": "/v1/calls",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "call"
    },
    {
      "key": "callsList",
      "displayName": "List Bland Calls",
      "description": "List calls.",
      "method": "GET",
      "path": "/v1/calls",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset"
      ]
    },
    {
      "key": "callGet",
      "displayName": "Get Bland Call",
      "description": "Get call details.",
      "method": "GET",
      "path": "/v1/calls/{callId}",
      "mutating": false,
      "required": [
        "callId"
      ],
      "queryParams": []
    },
    {
      "key": "pathwaysList",
      "displayName": "List Bland Pathways",
      "description": "List pathways.",
      "method": "GET",
      "path": "/v1/pathways",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "campaignCreate",
      "displayName": "Create Bland Campaign",
      "description": "Prepare campaign request.",
      "method": "POST",
      "path": "/v1/campaigns",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "campaign"
    }
  ]
};
