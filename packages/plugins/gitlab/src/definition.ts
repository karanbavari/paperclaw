import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.gitlab",
  "packageName": "@kesarcloud/plugin-gitlab",
  "version": "0.1.0",
  "displayName": "GitLab",
  "routePath": "gitlab",
  "description": "Connects PaperClaw agents to GitLab for projects, issues, merge requests, pipelines, jobs, releases, and repository files.",
  "apiBaseUrl": "https://gitlab.com/api/v4",
  "authUrl": "https://gitlab.com/oauth/authorize",
  "tokenUrl": "https://gitlab.com/oauth/token",
  "tokenLabel": "GitLab Personal Access Token",
  "oauthLabel": "GitLab OAuth",
  "connectedLabel": "Group or Project ID",
  "defaultScopes": [
    "api",
    "read_api",
    "read_repository"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "projectsList",
      "displayName": "List GitLab Projects",
      "description": "List projects.",
      "method": "GET",
      "path": "/projects",
      "mutating": false,
      "required": [],
      "queryParams": [
        "membership",
        "search",
        "per_page",
        "page"
      ]
    },
    {
      "key": "projectGet",
      "displayName": "Get GitLab Project",
      "description": "Get a project.",
      "method": "GET",
      "path": "/projects/{projectId}",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": []
    },
    {
      "key": "issuesList",
      "displayName": "List GitLab Issues",
      "description": "List project issues.",
      "method": "GET",
      "path": "/projects/{projectId}/issues",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": [
        "state",
        "labels",
        "per_page",
        "page"
      ]
    },
    {
      "key": "issueCreate",
      "displayName": "Create GitLab Issue",
      "description": "Create an issue.",
      "method": "POST",
      "path": "/projects/{projectId}/issues",
      "mutating": true,
      "required": [
        "projectId"
      ],
      "queryParams": [],
      "bodyParam": "issue"
    },
    {
      "key": "mergeRequestsList",
      "displayName": "List GitLab Merge Requests",
      "description": "List merge requests.",
      "method": "GET",
      "path": "/projects/{projectId}/merge_requests",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": [
        "state",
        "per_page",
        "page"
      ]
    },
    {
      "key": "mergeRequestNoteCreate",
      "displayName": "Comment GitLab Merge Request",
      "description": "Create a merge request note.",
      "method": "POST",
      "path": "/projects/{projectId}/merge_requests/{mergeRequestIid}/notes",
      "mutating": true,
      "required": [
        "projectId",
        "mergeRequestIid"
      ],
      "queryParams": [],
      "bodyParam": "note"
    },
    {
      "key": "pipelinesList",
      "displayName": "List GitLab Pipelines",
      "description": "List pipelines.",
      "method": "GET",
      "path": "/projects/{projectId}/pipelines",
      "mutating": false,
      "required": [
        "projectId"
      ],
      "queryParams": [
        "ref",
        "status",
        "per_page",
        "page"
      ]
    },
    {
      "key": "pipelineTrigger",
      "displayName": "Trigger GitLab Pipeline",
      "description": "Create a pipeline.",
      "method": "POST",
      "path": "/projects/{projectId}/pipeline",
      "mutating": true,
      "required": [
        "projectId"
      ],
      "queryParams": [
        "ref"
      ],
      "bodyParam": "variables"
    }
  ]
};
