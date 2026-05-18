import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.mailgun",
  "packageName": "@kesarcloud/plugin-mailgun",
  "version": "0.1.0",
  "displayName": "Mailgun",
  "routePath": "mailgun",
  "description": "Connects PaperClaw agents to Mailgun for email sending, validation, domains, suppressions, templates, and events.",
  "apiBaseUrl": "https://api.mailgun.net",
  "tokenLabel": "Mailgun Basic Credential",
  "oauthLabel": "Mailgun OAuth",
  "connectedLabel": "Connected Mailgun Account",
  "authScheme": "basic-pair",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "messageSend",
      "displayName": "Send Mailgun Message",
      "description": "Prepare a domain message send request.",
      "method": "POST",
      "path": "/v3/{domain}/messages",
      "mutating": true,
      "required": [
        "domain"
      ],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "domainsList",
      "displayName": "List Mailgun Domains",
      "description": "List domains.",
      "method": "GET",
      "path": "/v4/domains",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "skip"
      ]
    },
    {
      "key": "eventsList",
      "displayName": "List Mailgun Events",
      "description": "List domain events.",
      "method": "GET",
      "path": "/v3/{domain}/events",
      "mutating": false,
      "required": [
        "domain"
      ],
      "queryParams": [
        "limit",
        "event",
        "begin",
        "end"
      ]
    },
    {
      "key": "templatesList",
      "displayName": "List Mailgun Templates",
      "description": "List domain templates.",
      "method": "GET",
      "path": "/v3/{domain}/templates",
      "mutating": false,
      "required": [
        "domain"
      ],
      "queryParams": [
        "limit",
        "page"
      ]
    },
    {
      "key": "suppressionsList",
      "displayName": "List Mailgun Suppressions",
      "description": "List bounces/complaints/unsubscribes.",
      "method": "GET",
      "path": "/v3/{domain}/suppressions/{type}",
      "mutating": false,
      "required": [
        "domain",
        "type"
      ],
      "queryParams": [
        "limit",
        "page"
      ]
    }
  ]
};
