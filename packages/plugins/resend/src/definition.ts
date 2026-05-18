import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.resend",
  "packageName": "@kesarcloud/plugin-resend",
  "version": "0.1.0",
  "displayName": "Resend",
  "routePath": "resend",
  "description": "Connects PaperClaw agents to Resend for email sending, domains, API keys, audiences, contacts, and broadcast workflows.",
  "apiBaseUrl": "https://api.resend.com",
  "tokenLabel": "Resend API Key",
  "oauthLabel": "Resend OAuth",
  "connectedLabel": "Connected Resend Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "emailSend",
      "displayName": "Send Resend Email",
      "description": "Prepare a Resend email send request.",
      "method": "POST",
      "path": "/emails",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "domainsList",
      "displayName": "List Resend Domains",
      "description": "List domains.",
      "method": "GET",
      "path": "/domains",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "audiencesList",
      "displayName": "List Resend Audiences",
      "description": "List audiences.",
      "method": "GET",
      "path": "/audiences",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "contactsList",
      "displayName": "List Resend Contacts",
      "description": "List audience contacts.",
      "method": "GET",
      "path": "/audiences/{audienceId}/contacts",
      "mutating": false,
      "required": [
        "audienceId"
      ],
      "queryParams": []
    },
    {
      "key": "broadcastsCreate",
      "displayName": "Create Resend Broadcast",
      "description": "Prepare a broadcast creation request.",
      "method": "POST",
      "path": "/broadcasts",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "broadcast"
    }
  ]
};
