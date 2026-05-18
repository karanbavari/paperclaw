import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.postmark",
  "packageName": "@kesarcloud/plugin-postmark",
  "version": "0.1.0",
  "displayName": "Postmark",
  "routePath": "postmark",
  "description": "Connects PaperClaw agents to Postmark for transactional email, templates, servers, sender signatures, suppressions, and message activity.",
  "apiBaseUrl": "https://api.postmarkapp.com",
  "tokenLabel": "Postmark Server Token",
  "oauthLabel": "Postmark OAuth",
  "connectedLabel": "Connected Postmark Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "X-Postmark-Server-Token",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "emailSend",
      "displayName": "Send Postmark Email",
      "description": "Prepare a Postmark email send request.",
      "method": "POST",
      "path": "/email",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "emailWithTemplateSend",
      "displayName": "Send Postmark Template Email",
      "description": "Prepare a templated email send request.",
      "method": "POST",
      "path": "/email/withTemplate",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "templatesList",
      "displayName": "List Postmark Templates",
      "description": "List templates.",
      "method": "GET",
      "path": "/templates",
      "mutating": false,
      "required": [],
      "queryParams": [
        "count",
        "offset"
      ]
    },
    {
      "key": "templateGet",
      "displayName": "Get Postmark Template",
      "description": "Get template by ID.",
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
      "displayName": "List Postmark Suppressions",
      "description": "List suppressions.",
      "method": "GET",
      "path": "/message-streams/{streamId}/suppressions/dump",
      "mutating": false,
      "required": [
        "streamId"
      ],
      "queryParams": [
        "count",
        "offset"
      ]
    }
  ]
};
