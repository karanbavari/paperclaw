import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.google-rcs-business-messaging",
  "packageName": "@kesarcloud/plugin-google-rcs-business-messaging",
  "version": "0.1.0",
  "displayName": "Google RCS Business Messaging",
  "routePath": "google-rcs-business-messaging",
  "description": "Connects PaperClaw agents to Google RCS Business Messaging for RBM messages, events, files, testers, and agent launch workflows.",
  "apiBaseUrl": "https://rcsbusinessmessaging.googleapis.com",
  "tokenLabel": "Google OAuth Access Token",
  "oauthLabel": "Google RCS Business Messaging OAuth",
  "connectedLabel": "Connected Google RCS Business Messaging Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "messageSend",
      "displayName": "Send RBM Message",
      "description": "Prepare an RBM message send request.",
      "method": "POST",
      "path": "/v1/phones/{phoneNumber}/agentMessages",
      "mutating": true,
      "required": [
        "phoneNumber"
      ],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "eventSend",
      "displayName": "Send RBM Event",
      "description": "Prepare an RBM event request.",
      "method": "POST",
      "path": "/v1/phones/{phoneNumber}/agentEvents",
      "mutating": true,
      "required": [
        "phoneNumber"
      ],
      "queryParams": [],
      "bodyParam": "event"
    },
    {
      "key": "filesCreate",
      "displayName": "Create RBM File",
      "description": "Prepare media/file upload metadata request.",
      "method": "POST",
      "path": "/v1/files",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "file"
    },
    {
      "key": "testersList",
      "displayName": "List RBM Testers",
      "description": "List agent testers.",
      "method": "GET",
      "path": "/v1/agents/{agentId}/testers",
      "mutating": false,
      "required": [
        "agentId"
      ],
      "queryParams": [
        "pageSize",
        "pageToken"
      ]
    },
    {
      "key": "agentGet",
      "displayName": "Get RBM Agent",
      "description": "Get agent details.",
      "method": "GET",
      "path": "/v1/agents/{agentId}",
      "mutating": false,
      "required": [
        "agentId"
      ],
      "queryParams": []
    }
  ]
};
