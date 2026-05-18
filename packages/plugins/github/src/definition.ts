import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.github",
  "packageName": "@kesarcloud/plugin-github",
  "version": "0.1.0",
  "displayName": "GitHub",
  "routePath": "github",
  "description": "Connects PaperClaw agents to GitHub for repositories, issues, pull requests, branches, actions, releases, and code search.",
  "apiBaseUrl": "https://api.github.com",
  "authUrl": "https://github.com/login/oauth/authorize",
  "tokenUrl": "https://github.com/login/oauth/access_token",
  "tokenLabel": "GitHub Personal Access Token",
  "oauthLabel": "GitHub OAuth",
  "connectedLabel": "Owner or Organization",
  "defaultScopes": [
    "repo",
    "read:org",
    "workflow"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "reposList",
      "displayName": "List GitHub Repositories",
      "description": "List repositories for an owner.",
      "method": "GET",
      "path": "/orgs/{org}/repos",
      "mutating": false,
      "required": [
        "org"
      ],
      "queryParams": [
        "type",
        "per_page",
        "page"
      ]
    },
    {
      "key": "repoGet",
      "displayName": "Get GitHub Repository",
      "description": "Get a repository.",
      "method": "GET",
      "path": "/repos/{owner}/{repo}",
      "mutating": false,
      "required": [
        "owner",
        "repo"
      ],
      "queryParams": []
    },
    {
      "key": "issuesList",
      "displayName": "List GitHub Issues",
      "description": "List repository issues.",
      "method": "GET",
      "path": "/repos/{owner}/{repo}/issues",
      "mutating": false,
      "required": [
        "owner",
        "repo"
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
      "displayName": "Create GitHub Issue",
      "description": "Create an issue.",
      "method": "POST",
      "path": "/repos/{owner}/{repo}/issues",
      "mutating": true,
      "required": [
        "owner",
        "repo"
      ],
      "queryParams": [],
      "bodyParam": "issue"
    },
    {
      "key": "pullsList",
      "displayName": "List GitHub Pull Requests",
      "description": "List pull requests.",
      "method": "GET",
      "path": "/repos/{owner}/{repo}/pulls",
      "mutating": false,
      "required": [
        "owner",
        "repo"
      ],
      "queryParams": [
        "state",
        "per_page",
        "page"
      ]
    },
    {
      "key": "pullCommentCreate",
      "displayName": "Comment GitHub Issue or PR",
      "description": "Create an issue or PR comment.",
      "method": "POST",
      "path": "/repos/{owner}/{repo}/issues/{issueNumber}/comments",
      "mutating": true,
      "required": [
        "owner",
        "repo",
        "issueNumber"
      ],
      "queryParams": [],
      "bodyParam": "comment"
    },
    {
      "key": "workflowRunsList",
      "displayName": "List GitHub Workflow Runs",
      "description": "List workflow runs.",
      "method": "GET",
      "path": "/repos/{owner}/{repo}/actions/runs",
      "mutating": false,
      "required": [
        "owner",
        "repo"
      ],
      "queryParams": [
        "status",
        "branch",
        "per_page",
        "page"
      ]
    },
    {
      "key": "releaseCreate",
      "displayName": "Create GitHub Release",
      "description": "Create a release.",
      "method": "POST",
      "path": "/repos/{owner}/{repo}/releases",
      "mutating": true,
      "required": [
        "owner",
        "repo"
      ],
      "queryParams": [],
      "bodyParam": "release"
    }
  ]
};
