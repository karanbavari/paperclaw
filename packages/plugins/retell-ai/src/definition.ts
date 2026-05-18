import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.retell-ai",
  "packageName": "@kesarcloud/plugin-retell-ai",
  "version": "0.1.0",
  "displayName": "Retell AI",
  "routePath": "retell-ai",
  "description": "Connects PaperClaw agents to Retell AI for AI phone calls, agents, phone numbers, call analysis, and voice automation workflows.",
  "apiBaseUrl": "https://api.retellai.com",
  "tokenLabel": "Retell AI API Key",
  "oauthLabel": "Retell AI OAuth",
  "connectedLabel": "Connected Retell AI Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "phoneCallCreate",
      "displayName": "Create Retell Phone Call",
      "description": "Prepare outbound phone call request.",
      "method": "POST",
      "path": "/v2/create-phone-call",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "call"
    },
    {
      "key": "callsList",
      "displayName": "List Retell Calls",
      "description": "List calls.",
      "method": "GET",
      "path": "/v2/list-calls",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "pagination_key"
      ]
    },
    {
      "key": "callGet",
      "displayName": "Get Retell Call",
      "description": "Get call details.",
      "method": "GET",
      "path": "/v2/get-call/{callId}",
      "mutating": false,
      "required": [
        "callId"
      ],
      "queryParams": []
    },
    {
      "key": "agentsList",
      "displayName": "List Retell Agents",
      "description": "List agents.",
      "method": "GET",
      "path": "/list-agents",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "phoneNumbersList",
      "displayName": "List Retell Phone Numbers",
      "description": "List phone numbers.",
      "method": "GET",
      "path": "/list-phone-numbers",
      "mutating": false,
      "required": [],
      "queryParams": []
    }
  ]
};
