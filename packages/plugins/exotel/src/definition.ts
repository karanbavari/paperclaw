import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.exotel",
  "packageName": "@kesarcloud/plugin-exotel",
  "version": "0.1.0",
  "displayName": "Exotel",
  "routePath": "exotel",
  "description": "Connects PaperClaw agents to Exotel for Indian voice calls, SMS, WhatsApp, call details, recordings, and virtual number workflows.",
  "apiBaseUrl": "https://api.exotel.com",
  "tokenLabel": "Exotel SID:Token",
  "oauthLabel": "Exotel OAuth",
  "connectedLabel": "Connected Exotel Account",
  "authScheme": "basic-pair",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "callCreate",
      "displayName": "Create Exotel Call",
      "description": "Prepare outbound call request.",
      "method": "POST",
      "path": "/v1/Accounts/{accountSid}/Calls/connect",
      "mutating": true,
      "required": [
        "accountSid"
      ],
      "queryParams": [],
      "bodyParam": "call"
    },
    {
      "key": "callsList",
      "displayName": "List Exotel Calls",
      "description": "List calls.",
      "method": "GET",
      "path": "/v1/Accounts/{accountSid}/Calls",
      "mutating": false,
      "required": [
        "accountSid"
      ],
      "queryParams": [
        "PageSize",
        "Page"
      ]
    },
    {
      "key": "smsSend",
      "displayName": "Send Exotel SMS",
      "description": "Prepare SMS send request.",
      "method": "POST",
      "path": "/v1/Accounts/{accountSid}/Sms/send",
      "mutating": true,
      "required": [
        "accountSid"
      ],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "recordingGet",
      "displayName": "Get Exotel Recording",
      "description": "Get recording metadata.",
      "method": "GET",
      "path": "/v1/Accounts/{accountSid}/Calls/{callSid}/Recording",
      "mutating": false,
      "required": [
        "accountSid",
        "callSid"
      ],
      "queryParams": []
    },
    {
      "key": "whatsappSend",
      "displayName": "Send Exotel WhatsApp Message",
      "description": "Prepare WhatsApp message request.",
      "method": "POST",
      "path": "/v2/accounts/{accountSid}/messages",
      "mutating": true,
      "required": [
        "accountSid"
      ],
      "queryParams": [],
      "bodyParam": "message"
    }
  ]
};
