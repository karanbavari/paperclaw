import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.sinch",
  "packageName": "@kesarcloud/plugin-sinch",
  "version": "0.1.0",
  "displayName": "Sinch",
  "routePath": "sinch",
  "description": "Connects PaperClaw agents to Sinch Conversation API for WhatsApp, RCS, SMS, channels, contacts, messages, and webhooks.",
  "apiBaseUrl": "https://conversation.api.sinch.com",
  "tokenLabel": "Sinch Access Key:Secret",
  "oauthLabel": "Sinch OAuth",
  "connectedLabel": "Connected Sinch Account",
  "authScheme": "basic-pair",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "messageSend",
      "displayName": "Send Sinch Conversation Message",
      "description": "Prepare a Conversation API message.",
      "method": "POST",
      "path": "/v1/projects/{projectId}/messages:send",
      "mutating": true,
      "required": [
        "projectId"
      ],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "messagesList",
      "displayName": "List Sinch Messages",
      "description": "List conversation messages.",
      "method": "GET",
      "path": "/v1/projects/{projectId}/messages",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": [
        "page_size",
        "page_token",
        "conversation_id"
      ]
    },
    {
      "key": "contactsList",
      "displayName": "List Sinch Contacts",
      "description": "List contacts.",
      "method": "GET",
      "path": "/v1/projects/{projectId}/contacts",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": [
        "page_size",
        "page_token"
      ]
    },
    {
      "key": "conversationsList",
      "displayName": "List Sinch Conversations",
      "description": "List conversations.",
      "method": "GET",
      "path": "/v1/projects/{projectId}/conversations",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": [
        "page_size",
        "page_token",
        "contact_id"
      ]
    },
    {
      "key": "webhooksList",
      "displayName": "List Sinch Webhooks",
      "description": "List webhooks.",
      "method": "GET",
      "path": "/v1/projects/{projectId}/webhooks",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": []
    }
  ]
};
