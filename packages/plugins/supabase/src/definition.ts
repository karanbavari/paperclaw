import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.supabase",
  "packageName": "@kesarcloud/plugin-supabase",
  "version": "0.1.0",
  "displayName": "Supabase",
  "routePath": "supabase",
  "description": "Connects PaperClaw agents to Supabase Management APIs for organizations, projects, branches, API keys, functions, and storage.",
  "apiBaseUrl": "https://api.supabase.com",
  "tokenLabel": "Supabase Access Token",
  "oauthLabel": "Supabase OAuth",
  "connectedLabel": "Organization or Project Ref",
  "defaultScopes": [
    "projects.read",
    "projects.write"
  ],
  "rawPathPrefixes": [
    "/v1/"
  ],
  "endpoints": [
    {
      "key": "organizationsList",
      "displayName": "List Supabase Organizations",
      "description": "List organizations.",
      "method": "GET",
      "path": "/v1/organizations",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "projectsList",
      "displayName": "List Supabase Projects",
      "description": "List projects.",
      "method": "GET",
      "path": "/v1/projects",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "projectGet",
      "displayName": "Get Supabase Project",
      "description": "Get a project.",
      "method": "GET",
      "path": "/v1/projects/{projectRef}",
      "mutating": false,
      "required": [
        "projectRef"
      ],
      "queryParams": []
    },
    {
      "key": "projectCreate",
      "displayName": "Create Supabase Project",
      "description": "Create a project.",
      "method": "POST",
      "path": "/v1/projects",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "project"
    },
    {
      "key": "branchesList",
      "displayName": "List Supabase Branches",
      "description": "List project branches.",
      "method": "GET",
      "path": "/v1/projects/{projectRef}/branches",
      "mutating": false,
      "required": [
        "projectRef"
      ],
      "queryParams": []
    },
    {
      "key": "functionsList",
      "displayName": "List Supabase Functions",
      "description": "List Edge Functions.",
      "method": "GET",
      "path": "/v1/projects/{projectRef}/functions",
      "mutating": false,
      "required": [
        "projectRef"
      ],
      "queryParams": []
    },
    {
      "key": "functionDeploy",
      "displayName": "Deploy Supabase Function",
      "description": "Deploy an Edge Function.",
      "method": "POST",
      "path": "/v1/projects/{projectRef}/functions/deploy",
      "mutating": true,
      "required": [
        "projectRef"
      ],
      "queryParams": [],
      "bodyParam": "function"
    },
    {
      "key": "apiKeysList",
      "displayName": "List Supabase API Keys",
      "description": "List API keys metadata.",
      "method": "GET",
      "path": "/v1/projects/{projectRef}/api-keys",
      "mutating": false,
      "required": [
        "projectRef"
      ],
      "queryParams": []
    }
  ]
};
