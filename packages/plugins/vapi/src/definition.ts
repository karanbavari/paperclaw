import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.vapi",
  "packageName": "@kesarcloud/plugin-vapi",
  "version": "0.1.0",
  "displayName": "Vapi",
  "routePath": "vapi",
  "description": "Connects PaperClaw agents to Vapi for AI voice assistants, phone calls, phone numbers, call logs, and campaign-style voice workflows.",
  "apiBaseUrl": "https://api.vapi.ai",
  "tokenLabel": "Vapi API Key",
  "oauthLabel": "Vapi OAuth",
  "connectedLabel": "Connected Vapi Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "callCreate",
      "displayName": "Create Vapi Call",
      "description": "Prepare AI phone call request.",
      "method": "POST",
      "path": "/call",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "call"
    },
    {
      "key": "callsList",
      "displayName": "List Vapi Calls",
      "description": "List calls.",
      "method": "GET",
      "path": "/call",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "createdAtGt",
        "createdAtLt"
      ]
    },
    {
      "key": "callGet",
      "displayName": "Get Vapi Call",
      "description": "Get call details.",
      "method": "GET",
      "path": "/call/{callId}",
      "mutating": false,
      "required": [
        "callId"
      ],
      "queryParams": []
    },
    {
      "key": "assistantsList",
      "displayName": "List Vapi Assistants",
      "description": "List assistants.",
      "method": "GET",
      "path": "/assistant",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit"
      ]
    },
    {
      "key": "phoneNumbersList",
      "displayName": "List Vapi Phone Numbers",
      "description": "List phone numbers.",
      "method": "GET",
      "path": "/phone-number",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit"
      ]
    }
  ]
};
