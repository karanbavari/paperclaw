import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.brevo",
  "packageName": "@kesarcloud/plugin-brevo",
  "version": "0.1.0",
  "displayName": "Brevo",
  "routePath": "brevo",
  "description": "Connects PaperClaw agents to Brevo for transactional email, contacts, campaigns, senders, templates, and WhatsApp campaign workflows.",
  "apiBaseUrl": "https://api.brevo.com/v3",
  "tokenLabel": "Brevo API Key",
  "oauthLabel": "Brevo OAuth",
  "connectedLabel": "Connected Brevo Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "api-key",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "smtpEmailSend",
      "displayName": "Send Brevo Transactional Email",
      "description": "Prepare a transactional email request.",
      "method": "POST",
      "path": "/smtp/email",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "contactsList",
      "displayName": "List Brevo Contacts",
      "description": "List contacts.",
      "method": "GET",
      "path": "/contacts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "modifiedSince"
      ]
    },
    {
      "key": "emailCampaignsList",
      "displayName": "List Brevo Email Campaigns",
      "description": "List email campaigns.",
      "method": "GET",
      "path": "/emailCampaigns",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "status"
      ]
    },
    {
      "key": "templatesList",
      "displayName": "List Brevo SMTP Templates",
      "description": "List transactional templates.",
      "method": "GET",
      "path": "/smtp/templates",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset"
      ]
    },
    {
      "key": "sendersList",
      "displayName": "List Brevo Senders",
      "description": "List senders.",
      "method": "GET",
      "path": "/senders",
      "mutating": false,
      "required": [],
      "queryParams": []
    }
  ]
};
