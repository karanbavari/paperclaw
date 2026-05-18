import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.infobip",
  "packageName": "@kesarcloud/plugin-infobip",
  "version": "0.1.0",
  "displayName": "Infobip",
  "routePath": "infobip",
  "description": "Connects PaperClaw agents to Infobip for WhatsApp, RCS, SMS, email, voice, messages, reports, templates, and senders.",
  "apiBaseUrl": "https://api.infobip.com",
  "tokenLabel": "Infobip API Key",
  "oauthLabel": "Infobip OAuth",
  "connectedLabel": "Connected Infobip Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "Authorization",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "whatsappTextSend",
      "displayName": "Send Infobip WhatsApp Text",
      "description": "Prepare WhatsApp text send request.",
      "method": "POST",
      "path": "/whatsapp/1/message/text",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "rcsMessageSend",
      "displayName": "Send Infobip RCS Message",
      "description": "Prepare RCS message request.",
      "method": "POST",
      "path": "/ott/rcs/1/message",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "smsSend",
      "displayName": "Send Infobip SMS",
      "description": "Prepare SMS message request.",
      "method": "POST",
      "path": "/sms/2/text/advanced",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "emailSend",
      "displayName": "Send Infobip Email",
      "description": "Prepare email send request.",
      "method": "POST",
      "path": "/email/3/send",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "reportsList",
      "displayName": "List Infobip Reports",
      "description": "List delivery reports.",
      "method": "GET",
      "path": "/sms/1/reports",
      "mutating": false,
      "required": [],
      "queryParams": [
        "bulkId",
        "messageId",
        "limit"
      ]
    }
  ]
};
