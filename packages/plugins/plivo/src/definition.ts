import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.plivo",
  "packageName": "@kesarcloud/plugin-plivo",
  "version": "0.1.0",
  "displayName": "Plivo",
  "routePath": "plivo",
  "description": "Connects PaperClaw agents to Plivo for SMS, WhatsApp, voice calls, numbers, message logs, recordings, and compliance workflows.",
  "apiBaseUrl": "https://api.plivo.com",
  "tokenLabel": "Plivo Auth ID:Auth Token",
  "oauthLabel": "Plivo OAuth",
  "connectedLabel": "Connected Plivo Account",
  "authScheme": "basic-pair",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "messageCreate",
      "displayName": "Create Plivo Message",
      "description": "Prepare SMS/WhatsApp message request.",
      "method": "POST",
      "path": "/v1/Account/{authId}/Message/",
      "mutating": true,
      "required": [
        "authId"
      ],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "messagesList",
      "displayName": "List Plivo Messages",
      "description": "List messages.",
      "method": "GET",
      "path": "/v1/Account/{authId}/Message/",
      "mutating": false,
      "required": [
        "authId"
      ],
      "queryParams": [
        "limit",
        "offset",
        "message_state"
      ]
    },
    {
      "key": "callCreate",
      "displayName": "Create Plivo Call",
      "description": "Prepare outbound call request.",
      "method": "POST",
      "path": "/v1/Account/{authId}/Call/",
      "mutating": true,
      "required": [
        "authId"
      ],
      "queryParams": [],
      "bodyParam": "call"
    },
    {
      "key": "callsList",
      "displayName": "List Plivo Calls",
      "description": "List calls.",
      "method": "GET",
      "path": "/v1/Account/{authId}/Call/",
      "mutating": false,
      "required": [
        "authId"
      ],
      "queryParams": [
        "limit",
        "offset",
        "call_direction"
      ]
    },
    {
      "key": "numbersList",
      "displayName": "List Plivo Numbers",
      "description": "List numbers.",
      "method": "GET",
      "path": "/v1/Account/{authId}/Number/",
      "mutating": false,
      "required": [
        "authId"
      ],
      "queryParams": [
        "limit",
        "offset"
      ]
    }
  ]
};
