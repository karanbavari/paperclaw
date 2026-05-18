import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.snyk",
  "packageName": "@kesarcloud/plugin-snyk",
  "version": "0.1.0",
  "displayName": "Snyk",
  "routePath": "snyk",
  "description": "Connects PaperClaw agents to Snyk for organizations, projects, targets, issues, dependencies, reporting, and vulnerability workflows.",
  "apiBaseUrl": "https://api.snyk.io",
  "tokenLabel": "Snyk API Token",
  "oauthLabel": "Snyk OAuth",
  "connectedLabel": "Organization ID",
  "defaultScopes": [
    "org.read",
    "project.read",
    "project.write"
  ],
  "rawPathPrefixes": [
    "/rest/",
    "/v1/"
  ],
  "endpoints": [
    {
      "key": "orgsList",
      "displayName": "List Snyk Organizations",
      "description": "List organizations.",
      "method": "GET",
      "path": "/rest/orgs",
      "mutating": false,
      "required": [],
      "queryParams": [
        "version",
        "limit",
        "starting_after"
      ]
    },
    {
      "key": "projectsList",
      "displayName": "List Snyk Projects",
      "description": "List organization projects.",
      "method": "GET",
      "path": "/rest/orgs/{orgId}/projects",
      "mutating": false,
      "required": [
        "orgId"
      ],
      "queryParams": [
        "version",
        "limit",
        "starting_after"
      ]
    },
    {
      "key": "projectGet",
      "displayName": "Get Snyk Project",
      "description": "Get a project.",
      "method": "GET",
      "path": "/rest/orgs/{orgId}/projects/{projectId}",
      "mutating": false,
      "required": [
        "orgId",
        "projectId"
      ],
      "queryParams": [
        "version"
      ]
    },
    {
      "key": "targetsList",
      "displayName": "List Snyk Targets",
      "description": "List targets.",
      "method": "GET",
      "path": "/rest/orgs/{orgId}/targets",
      "mutating": false,
      "required": [
        "orgId"
      ],
      "queryParams": [
        "version",
        "limit",
        "starting_after"
      ]
    },
    {
      "key": "issuesList",
      "displayName": "List Snyk Issues",
      "description": "List issues.",
      "method": "GET",
      "path": "/rest/orgs/{orgId}/issues",
      "mutating": false,
      "required": [
        "orgId"
      ],
      "queryParams": [
        "version",
        "limit",
        "starting_after"
      ]
    },
    {
      "key": "projectTest",
      "displayName": "Test Snyk Project",
      "description": "Request project test.",
      "method": "POST",
      "path": "/v1/org/{orgId}/project/{projectId}/test",
      "mutating": true,
      "required": [
        "orgId",
        "projectId"
      ],
      "queryParams": [],
      "bodyParam": "test"
    },
    {
      "key": "projectDeactivate",
      "displayName": "Deactivate Snyk Project",
      "description": "Deactivate a project.",
      "method": "DELETE",
      "path": "/v1/org/{orgId}/project/{projectId}",
      "mutating": true,
      "required": [
        "orgId",
        "projectId"
      ],
      "queryParams": []
    },
    {
      "key": "dependenciesList",
      "displayName": "List Snyk Dependencies",
      "description": "List project dependencies.",
      "method": "GET",
      "path": "/v1/org/{orgId}/project/{projectId}/dep-graph",
      "mutating": false,
      "required": [
        "orgId",
        "projectId"
      ],
      "queryParams": []
    }
  ]
};
