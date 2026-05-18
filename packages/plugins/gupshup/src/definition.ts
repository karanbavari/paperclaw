import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.gupshup",
  "packageName": "@kesarcloud/plugin-gupshup",
  "version": "0.1.0",
  "displayName": "Gupshup",
  "routePath": "gupshup",
  "description": "Connects PaperClaw agents to Gupshup for WhatsApp Business messaging, templates, app management, opt-ins, and message status workflows.",
  "apiBaseUrl": "https://api.gupshup.io",
  "tokenLabel": "Gupshup API Key",
  "oauthLabel": "Gupshup OAuth",
  "connectedLabel": "Connected Gupshup Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "apikey",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "messageSend",
      "displayName": "Send Gupshup WhatsApp Message",
      "description": "Prepare WhatsApp message request.",
      "method": "POST",
      "path": "/sm/api/v1/msg",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "templatesList",
      "displayName": "List Gupshup Templates",
      "description": "List app templates.",
      "method": "GET",
      "path": "/sm/api/v1/template/list/{appId}",
      "mutating": false,
      "required": [
        "appId"
      ],
      "queryParams": []
    },
    {
      "key": "optInCreate",
      "displayName": "Create Gupshup Opt-In",
      "description": "Prepare opt-in request.",
      "method": "POST",
      "path": "/sm/api/v1/app/opt/in/{appName}",
      "mutating": true,
      "required": [
        "appName"
      ],
      "queryParams": [],
      "bodyParam": "optIn"
    },
    {
      "key": "appGet",
      "displayName": "Get Gupshup App",
      "description": "Get app info.",
      "method": "GET",
      "path": "/sm/api/v1/app/{appName}",
      "mutating": false,
      "required": [
        "appName"
      ],
      "queryParams": []
    },
    {
      "key": "messageStatusGet",
      "displayName": "Get Gupshup Message Status",
      "description": "Get message status.",
      "method": "GET",
      "path": "/sm/api/v1/msg/{messageId}",
      "mutating": false,
      "required": [
        "messageId"
      ],
      "queryParams": []
    }
  ]
};
