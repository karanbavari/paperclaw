import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.netlify",
  "packageName": "@kesarcloud/plugin-netlify",
  "version": "0.1.0",
  "displayName": "Netlify",
  "routePath": "netlify",
  "description": "Connects PaperClaw agents to Netlify for sites, deploys, forms, functions, environment variables, domains, and build hooks.",
  "apiBaseUrl": "https://api.netlify.com/api/v1",
  "authUrl": "https://app.netlify.com/authorize",
  "tokenUrl": "https://api.netlify.com/oauth/token",
  "tokenLabel": "Netlify Personal Access Token",
  "oauthLabel": "Netlify OAuth",
  "connectedLabel": "Account or Site ID",
  "defaultScopes": [
    "read",
    "write"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "sitesList",
      "displayName": "List Netlify Sites",
      "description": "List sites.",
      "method": "GET",
      "path": "/sites",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "per_page",
        "filter"
      ]
    },
    {
      "key": "siteGet",
      "displayName": "Get Netlify Site",
      "description": "Get a site.",
      "method": "GET",
      "path": "/sites/{siteId}",
      "mutating": false,
      "required": [
        "siteId"
      ],
      "queryParams": []
    },
    {
      "key": "deploysList",
      "displayName": "List Netlify Deploys",
      "description": "List site deploys.",
      "method": "GET",
      "path": "/sites/{siteId}/deploys",
      "mutating": false,
      "required": [
        "siteId"
      ],
      "queryParams": [
        "page",
        "per_page"
      ]
    },
    {
      "key": "deployCreate",
      "displayName": "Create Netlify Deploy",
      "description": "Create a deploy.",
      "method": "POST",
      "path": "/sites/{siteId}/deploys",
      "mutating": true,
      "required": [
        "siteId"
      ],
      "queryParams": [],
      "bodyParam": "deploy"
    },
    {
      "key": "formsList",
      "displayName": "List Netlify Forms",
      "description": "List site forms.",
      "method": "GET",
      "path": "/sites/{siteId}/forms",
      "mutating": false,
      "required": [
        "siteId"
      ],
      "queryParams": []
    },
    {
      "key": "envVarsList",
      "displayName": "List Netlify Env Vars",
      "description": "List environment variables.",
      "method": "GET",
      "path": "/accounts/{accountId}/env",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": [
        "site_id"
      ]
    },
    {
      "key": "envVarCreate",
      "displayName": "Create Netlify Env Var",
      "description": "Create an environment variable.",
      "method": "POST",
      "path": "/accounts/{accountId}/env",
      "mutating": true,
      "required": [
        "accountId"
      ],
      "queryParams": [],
      "bodyParam": "envVar"
    },
    {
      "key": "buildHookCreate",
      "displayName": "Create Netlify Build Hook",
      "description": "Create a build hook.",
      "method": "POST",
      "path": "/sites/{siteId}/build_hooks",
      "mutating": true,
      "required": [
        "siteId"
      ],
      "queryParams": [],
      "bodyParam": "buildHook"
    }
  ]
};
