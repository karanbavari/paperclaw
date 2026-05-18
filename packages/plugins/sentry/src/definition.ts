import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.sentry",
  "packageName": "@kesarcloud/plugin-sentry",
  "version": "0.1.0",
  "displayName": "Sentry",
  "routePath": "sentry",
  "description": "Connects PaperClaw agents to Sentry for organizations, projects, issues, events, releases, teams, alerts, and performance data.",
  "apiBaseUrl": "https://sentry.io/api/0",
  "authUrl": "https://sentry.io/oauth/authorize",
  "tokenUrl": "https://sentry.io/oauth/token",
  "tokenLabel": "Sentry Auth Token",
  "oauthLabel": "Sentry OAuth",
  "connectedLabel": "Organization Slug",
  "defaultScopes": [
    "org:read",
    "project:read",
    "project:write",
    "event:read",
    "event:write"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "organizationsList",
      "displayName": "List Sentry Organizations",
      "description": "List organizations.",
      "method": "GET",
      "path": "/organizations/",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "projectsList",
      "displayName": "List Sentry Projects",
      "description": "List organization projects.",
      "method": "GET",
      "path": "/organizations/{organizationSlug}/projects/",
      "mutating": false,
      "required": [
        "organizationSlug"
      ],
      "queryParams": [
        "cursor"
      ]
    },
    {
      "key": "issuesList",
      "displayName": "List Sentry Issues",
      "description": "List organization issues.",
      "method": "GET",
      "path": "/organizations/{organizationSlug}/issues/",
      "mutating": false,
      "required": [
        "organizationSlug"
      ],
      "queryParams": [
        "project",
        "query",
        "cursor"
      ]
    },
    {
      "key": "issueUpdate",
      "displayName": "Update Sentry Issue",
      "description": "Update an issue.",
      "method": "PUT",
      "path": "/issues/{issueId}/",
      "mutating": true,
      "required": [
        "issueId"
      ],
      "queryParams": [],
      "bodyParam": "issue"
    },
    {
      "key": "eventsList",
      "displayName": "List Sentry Events",
      "description": "List project events.",
      "method": "GET",
      "path": "/projects/{organizationSlug}/{projectSlug}/events/",
      "mutating": false,
      "required": [
        "organizationSlug",
        "projectSlug"
      ],
      "queryParams": [
        "cursor",
        "query"
      ]
    },
    {
      "key": "releasesList",
      "displayName": "List Sentry Releases",
      "description": "List releases.",
      "method": "GET",
      "path": "/organizations/{organizationSlug}/releases/",
      "mutating": false,
      "required": [
        "organizationSlug"
      ],
      "queryParams": [
        "cursor"
      ]
    },
    {
      "key": "releaseCreate",
      "displayName": "Create Sentry Release",
      "description": "Create a release.",
      "method": "POST",
      "path": "/organizations/{organizationSlug}/releases/",
      "mutating": true,
      "required": [
        "organizationSlug"
      ],
      "queryParams": [],
      "bodyParam": "release"
    },
    {
      "key": "teamsList",
      "displayName": "List Sentry Teams",
      "description": "List teams.",
      "method": "GET",
      "path": "/organizations/{organizationSlug}/teams/",
      "mutating": false,
      "required": [
        "organizationSlug"
      ],
      "queryParams": [
        "cursor"
      ]
    }
  ]
};
