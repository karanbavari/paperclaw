import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.hasura",
  "packageName": "@kesarcloud/plugin-hasura",
  "version": "0.1.0",
  "displayName": "Hasura",
  "routePath": "hasura",
  "description": "Connects PaperClaw agents to Hasura GraphQL Engine APIs for metadata, query execution, sources, actions, events, and permissions.",
  "apiBaseUrl": "https://hasura.example.com",
  "tokenLabel": "Hasura Admin Secret",
  "oauthLabel": "Hasura OAuth",
  "connectedLabel": "Hasura Project",
  "apiBaseUrlLabel": "Hasura GraphQL Engine Base URL",
  "authScheme": "api-key",
  "accessTokenHeaderName": "x-hasura-admin-secret",
  "defaultScopes": [
    "metadata",
    "graphql"
  ],
  "rawPathPrefixes": [
    "/v1/"
  ],
  "endpoints": [
    {
      "key": "metadataExport",
      "displayName": "Export Hasura Metadata",
      "description": "Export metadata.",
      "method": "POST",
      "path": "/v1/metadata",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "metadataReplace",
      "displayName": "Replace Hasura Metadata",
      "description": "Replace metadata.",
      "method": "POST",
      "path": "/v1/metadata",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "graphqlQuery",
      "displayName": "Run Hasura GraphQL Query",
      "description": "Run GraphQL.",
      "method": "POST",
      "path": "/v1/graphql",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "graphqlMutation",
      "displayName": "Run Hasura GraphQL Mutation",
      "description": "Run GraphQL mutation.",
      "method": "POST",
      "path": "/v1/graphql",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "queryRun",
      "displayName": "Run Hasura SQL Query",
      "description": "Run a Hasura query API request.",
      "method": "POST",
      "path": "/v1/query",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "sourceTrackTable",
      "displayName": "Track Hasura Table",
      "description": "Track a database table.",
      "method": "POST",
      "path": "/v1/metadata",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "eventTriggerCreate",
      "displayName": "Create Hasura Event Trigger",
      "description": "Create event trigger metadata.",
      "method": "POST",
      "path": "/v1/metadata",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    }
  ]
};
