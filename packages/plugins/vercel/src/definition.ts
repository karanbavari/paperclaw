import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.vercel",
  "packageName": "@kesarcloud/plugin-vercel",
  "version": "0.1.0",
  "displayName": "Vercel",
  "routePath": "vercel",
  "description": "Connects PaperClaw agents to Vercel for teams, projects, deployments, aliases, environment variables, domains, and checks.",
  "apiBaseUrl": "https://api.vercel.com",
  "authUrl": "https://vercel.com/oauth/authorize",
  "tokenUrl": "https://api.vercel.com/v2/oauth/access_token",
  "tokenLabel": "Vercel Access Token",
  "oauthLabel": "Vercel OAuth",
  "connectedLabel": "Team ID",
  "defaultScopes": [
    "read",
    "write"
  ],
  "rawPathPrefixes": [
    "/v1/",
    "/v2/",
    "/v3/",
    "/v6/",
    "/v9/",
    "/v10/",
    "/v13/"
  ],
  "endpoints": [
    {
      "key": "teamsList",
      "displayName": "List Vercel Teams",
      "description": "List teams.",
      "method": "GET",
      "path": "/v2/teams",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "projectsList",
      "displayName": "List Vercel Projects",
      "description": "List projects.",
      "method": "GET",
      "path": "/v9/projects",
      "mutating": false,
      "required": [],
      "queryParams": [
        "teamId",
        "limit",
        "from"
      ]
    },
    {
      "key": "projectGet",
      "displayName": "Get Vercel Project",
      "description": "Get a project.",
      "method": "GET",
      "path": "/v9/projects/{projectIdOrName}",
      "mutating": false,
      "required": [
        "projectIdOrName"
      ],
      "queryParams": [
        "teamId"
      ]
    },
    {
      "key": "deploymentsList",
      "displayName": "List Vercel Deployments",
      "description": "List deployments.",
      "method": "GET",
      "path": "/v6/deployments",
      "mutating": false,
      "required": [],
      "queryParams": [
        "teamId",
        "projectId",
        "limit",
        "from"
      ]
    },
    {
      "key": "deploymentCreate",
      "displayName": "Create Vercel Deployment",
      "description": "Create a deployment.",
      "method": "POST",
      "path": "/v13/deployments",
      "mutating": true,
      "required": [],
      "queryParams": [
        "teamId"
      ],
      "bodyParam": "deployment"
    },
    {
      "key": "envVarsList",
      "displayName": "List Vercel Env Vars",
      "description": "List project environment variables.",
      "method": "GET",
      "path": "/v10/projects/{projectIdOrName}/env",
      "mutating": false,
      "required": [
        "projectIdOrName"
      ],
      "queryParams": [
        "teamId"
      ]
    },
    {
      "key": "envVarCreate",
      "displayName": "Create Vercel Env Var",
      "description": "Create an environment variable.",
      "method": "POST",
      "path": "/v10/projects/{projectIdOrName}/env",
      "mutating": true,
      "required": [
        "projectIdOrName"
      ],
      "queryParams": [
        "teamId"
      ],
      "bodyParam": "envVar"
    },
    {
      "key": "domainsList",
      "displayName": "List Vercel Domains",
      "description": "List domains.",
      "method": "GET",
      "path": "/v5/domains",
      "mutating": false,
      "required": [],
      "queryParams": [
        "teamId",
        "limit",
        "since"
      ]
    }
  ]
};
