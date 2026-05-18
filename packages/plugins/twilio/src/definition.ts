import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.twilio",
  "packageName": "@kesarcloud/plugin-twilio",
  "version": "0.1.0",
  "displayName": "Twilio",
  "routePath": "twilio",
  "description": "Connects PaperClaw agents to Twilio for SMS, WhatsApp, RCS-capable Messaging, calls, conferences, recordings, and message services.",
  "apiBaseUrl": "https://api.twilio.com",
  "tokenLabel": "Twilio Account SID:Auth Token",
  "oauthLabel": "Twilio OAuth",
  "connectedLabel": "Connected Twilio Account",
  "authScheme": "basic-pair",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "messageCreate",
      "displayName": "Create Twilio Message",
      "description": "Prepare SMS/WhatsApp/RCS-capable message request.",
      "method": "POST",
      "path": "/2010-04-01/Accounts/{accountSid}/Messages.json",
      "mutating": true,
      "required": [
        "accountSid"
      ],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "messagesList",
      "displayName": "List Twilio Messages",
      "description": "List messages.",
      "method": "GET",
      "path": "/2010-04-01/Accounts/{accountSid}/Messages.json",
      "mutating": false,
      "required": [
        "accountSid"
      ],
      "queryParams": [
        "To",
        "From",
        "DateSent",
        "PageSize"
      ]
    },
    {
      "key": "callCreate",
      "displayName": "Create Twilio Call",
      "description": "Prepare outbound call request.",
      "method": "POST",
      "path": "/2010-04-01/Accounts/{accountSid}/Calls.json",
      "mutating": true,
      "required": [
        "accountSid"
      ],
      "queryParams": [],
      "bodyParam": "call"
    },
    {
      "key": "callsList",
      "displayName": "List Twilio Calls",
      "description": "List calls.",
      "method": "GET",
      "path": "/2010-04-01/Accounts/{accountSid}/Calls.json",
      "mutating": false,
      "required": [
        "accountSid"
      ],
      "queryParams": [
        "To",
        "From",
        "Status",
        "PageSize"
      ]
    },
    {
      "key": "messagingServicesList",
      "displayName": "List Messaging Services",
      "description": "List messaging services.",
      "method": "GET",
      "path": "/v1/Services",
      "mutating": false,
      "required": [],
      "queryParams": [
        "PageSize"
      ]
    }
  ]
};
