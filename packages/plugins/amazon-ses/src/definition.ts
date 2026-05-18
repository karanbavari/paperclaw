import type { CommunicationDefinition } from "@kesarcloud/plugin-communication-core";

export const definition: CommunicationDefinition = {
  "id": "paperclaw.amazon-ses",
  "packageName": "@kesarcloud/plugin-amazon-ses",
  "version": "0.1.0",
  "displayName": "Amazon SES",
  "routePath": "amazon-ses",
  "description": "Connects PaperClaw agents to Amazon SES v2 for email send, templates, identities, suppression lists, and account sending status.",
  "apiBaseUrl": "https://email.us-east-1.amazonaws.com",
  "tokenLabel": "AWS SigV4 Authorization Header",
  "oauthLabel": "Amazon SES OAuth",
  "connectedLabel": "Connected Amazon SES Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "Authorization",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "emailSend",
      "displayName": "Send SES Email",
      "description": "Prepare an SES SendEmail request.",
      "method": "POST",
      "path": "/v2/email/outbound-emails",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "message"
    },
    {
      "key": "templatesList",
      "displayName": "List SES Templates",
      "description": "List email templates.",
      "method": "GET",
      "path": "/v2/email/templates",
      "mutating": false,
      "required": [],
      "queryParams": [
        "PageSize",
        "NextToken"
      ]
    },
    {
      "key": "templateGet",
      "displayName": "Get SES Template",
      "description": "Get email template.",
      "method": "GET",
      "path": "/v2/email/templates/{templateName}",
      "mutating": false,
      "required": [
        "templateName"
      ],
      "queryParams": []
    },
    {
      "key": "identitiesList",
      "displayName": "List SES Identities",
      "description": "List email identities.",
      "method": "GET",
      "path": "/v2/email/identities",
      "mutating": false,
      "required": [],
      "queryParams": [
        "PageSize",
        "NextToken"
      ]
    },
    {
      "key": "suppressedDestinationsList",
      "displayName": "List SES Suppressed Destinations",
      "description": "List suppressed destinations.",
      "method": "GET",
      "path": "/v2/email/suppression/addresses",
      "mutating": false,
      "required": [],
      "queryParams": [
        "PageSize",
        "NextToken"
      ]
    }
  ]
};
