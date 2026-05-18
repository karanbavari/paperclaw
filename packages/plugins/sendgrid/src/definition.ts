import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.sendgrid",
  "packageName": "@kesarcloud/plugin-sendgrid",
  "version": "0.1.0",
  "displayName": "SendGrid",
  "routePath": "sendgrid",
  "description": "Connects PaperClaw agents to SendGrid for transactional email, templates, suppressions, sender identities, and email activity workflows.",
  "apiBaseUrl": "https://api.sendgrid.com/v3",
  "tokenLabel": "SendGrid API Key",
  "oauthLabel": "SendGrid OAuth",
  "connectedLabel": "Connected SendGrid Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "mailSend",
      "displayName": "Send SendGrid Email",
      "description": "Prepare a SendGrid Mail Send request.",
      "method": "POST",
      "path": "/mail/send",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "templatesList",
      "displayName": "List SendGrid Templates",
      "description": "List dynamic templates.",
      "method": "GET",
      "path": "/templates",
      "mutating": false,
      "required": [],
      "queryParams": [
        "generations",
        "page_size",
        "page_token"
      ]
    },
    {
      "key": "templateGet",
      "displayName": "Get SendGrid Template",
      "description": "Get template details.",
      "method": "GET",
      "path": "/templates/{templateId}",
      "mutating": false,
      "required": [
        "templateId"
      ],
      "queryParams": []
    },
    {
      "key": "suppressionsList",
      "displayName": "List Global Suppressions",
      "description": "List global suppressions.",
      "method": "GET",
      "path": "/asm/suppressions/global",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset"
      ]
    },
    {
      "key": "sendersList",
      "displayName": "List Sender Identities",
      "description": "List verified sender identities.",
      "method": "GET",
      "path": "/verified_senders",
      "mutating": false,
      "required": [],
      "queryParams": []
    }
  ]
};
