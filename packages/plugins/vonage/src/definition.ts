import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.vonage",
  "packageName": "@kesarcloud/plugin-vonage",
  "version": "0.1.0",
  "displayName": "Vonage",
  "routePath": "vonage",
  "description": "Connects PaperClaw agents to Vonage for Messages API, WhatsApp, SMS, Viber, Messenger, voice calls, and verification workflows.",
  "apiBaseUrl": "https://api.nexmo.com",
  "tokenLabel": "Vonage API Token",
  "oauthLabel": "Vonage OAuth",
  "connectedLabel": "Connected Vonage Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "messageSend",
      "displayName": "Send Vonage Message",
      "description": "Prepare Messages API send request.",
      "method": "POST",
      "path": "/v1/messages",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "applicationGet",
      "displayName": "Get Vonage Application",
      "description": "Get application.",
      "method": "GET",
      "path": "/v2/applications/{applicationId}",
      "mutating": false,
      "required": [
        "applicationId"
      ],
      "queryParams": []
    },
    {
      "key": "applicationsList",
      "displayName": "List Vonage Applications",
      "description": "List applications.",
      "method": "GET",
      "path": "/v2/applications",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page_size",
        "page"
      ]
    },
    {
      "key": "callCreate",
      "displayName": "Create Vonage Call",
      "description": "Prepare voice call request.",
      "method": "POST",
      "path": "/v1/calls",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "call"
    },
    {
      "key": "callsList",
      "displayName": "List Vonage Calls",
      "description": "List calls.",
      "method": "GET",
      "path": "/v1/calls",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page_size",
        "record_index"
      ]
    }
  ]
};
