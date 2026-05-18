import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.meta-whatsapp-cloud",
  "packageName": "@kesarcloud/plugin-meta-whatsapp-cloud",
  "version": "0.1.0",
  "displayName": "Meta WhatsApp Cloud API",
  "routePath": "meta-whatsapp-cloud",
  "description": "Connects PaperClaw agents to Meta WhatsApp Cloud API for messages, templates, media, phone numbers, and business profile workflows.",
  "apiBaseUrl": "https://graph.facebook.com/v20.0",
  "tokenLabel": "Meta WhatsApp Access Token",
  "oauthLabel": "Meta WhatsApp Cloud API OAuth",
  "connectedLabel": "Connected Meta WhatsApp Cloud API Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "messageSend",
      "displayName": "Send WhatsApp Cloud Message",
      "description": "Prepare a WhatsApp message send request.",
      "method": "POST",
      "path": "/{phoneNumberId}/messages",
      "mutating": true,
      "required": [
        "phoneNumberId"
      ],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "templatesList",
      "displayName": "List WhatsApp Templates",
      "description": "List message templates.",
      "method": "GET",
      "path": "/{businessAccountId}/message_templates",
      "mutating": false,
      "required": [
        "businessAccountId"
      ],
      "queryParams": [
        "limit",
        "after",
        "name",
        "status"
      ]
    },
    {
      "key": "mediaUpload",
      "displayName": "Upload WhatsApp Media",
      "description": "Prepare media upload request.",
      "method": "POST",
      "path": "/{phoneNumberId}/media",
      "mutating": true,
      "required": [
        "phoneNumberId"
      ],
      "queryParams": [],
      "bodyParam": "media"
    },
    {
      "key": "mediaGet",
      "displayName": "Get WhatsApp Media",
      "description": "Get media metadata.",
      "method": "GET",
      "path": "/{mediaId}",
      "mutating": false,
      "required": [
        "mediaId"
      ],
      "queryParams": []
    },
    {
      "key": "businessProfileGet",
      "displayName": "Get WhatsApp Business Profile",
      "description": "Get business profile.",
      "method": "GET",
      "path": "/{phoneNumberId}/whatsapp_business_profile",
      "mutating": false,
      "required": [
        "phoneNumberId"
      ],
      "queryParams": [
        "fields"
      ]
    }
  ]
};
