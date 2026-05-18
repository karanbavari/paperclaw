import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.bitbucket",
  "packageName": "@kesarcloud/plugin-bitbucket",
  "version": "0.1.0",
  "displayName": "Bitbucket",
  "routePath": "bitbucket",
  "description": "Connects PaperClaw agents to Bitbucket Cloud for workspaces, repositories, pull requests, issues, pipelines, and deployments.",
  "apiBaseUrl": "https://api.bitbucket.org/2.0",
  "authUrl": "https://bitbucket.org/site/oauth2/authorize",
  "tokenUrl": "https://bitbucket.org/site/oauth2/access_token",
  "tokenAuthStyle": "basic",
  "tokenLabel": "Bitbucket Access Token",
  "oauthLabel": "Bitbucket OAuth",
  "connectedLabel": "Workspace",
  "defaultScopes": [
    "repository",
    "pullrequest",
    "issue",
    "pipeline"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "repositoriesList",
      "displayName": "List Bitbucket Repositories",
      "description": "List workspace repositories.",
      "method": "GET",
      "path": "/repositories/{workspace}",
      "mutating": false,
      "required": [
        "workspace"
      ],
      "queryParams": [
        "pagelen",
        "page",
        "q"
      ]
    },
    {
      "key": "repositoryGet",
      "displayName": "Get Bitbucket Repository",
      "description": "Get a repository.",
      "method": "GET",
      "path": "/repositories/{workspace}/{repoSlug}",
      "mutating": false,
      "required": [
        "workspace",
        "repoSlug"
      ],
      "queryParams": []
    },
    {
      "key": "pullRequestsList",
      "displayName": "List Bitbucket Pull Requests",
      "description": "List pull requests.",
      "method": "GET",
      "path": "/repositories/{workspace}/{repoSlug}/pullrequests",
      "mutating": false,
      "required": [
        "workspace",
        "repoSlug"
      ],
      "queryParams": [
        "state",
        "pagelen",
        "page"
      ]
    },
    {
      "key": "pullRequestCreate",
      "displayName": "Create Bitbucket Pull Request",
      "description": "Create a pull request.",
      "method": "POST",
      "path": "/repositories/{workspace}/{repoSlug}/pullrequests",
      "mutating": true,
      "required": [
        "workspace",
        "repoSlug"
      ],
      "queryParams": [],
      "bodyParam": "pullRequest"
    },
    {
      "key": "issuesList",
      "displayName": "List Bitbucket Issues",
      "description": "List issues.",
      "method": "GET",
      "path": "/repositories/{workspace}/{repoSlug}/issues",
      "mutating": false,
      "required": [
        "workspace",
        "repoSlug"
      ],
      "queryParams": [
        "state",
        "kind",
        "pagelen",
        "page"
      ]
    },
    {
      "key": "issueCreate",
      "displayName": "Create Bitbucket Issue",
      "description": "Create an issue.",
      "method": "POST",
      "path": "/repositories/{workspace}/{repoSlug}/issues",
      "mutating": true,
      "required": [
        "workspace",
        "repoSlug"
      ],
      "queryParams": [],
      "bodyParam": "issue"
    },
    {
      "key": "pipelinesList",
      "displayName": "List Bitbucket Pipelines",
      "description": "List pipelines.",
      "method": "GET",
      "path": "/repositories/{workspace}/{repoSlug}/pipelines",
      "mutating": false,
      "required": [
        "workspace",
        "repoSlug"
      ],
      "queryParams": [
        "pagelen",
        "page"
      ]
    },
    {
      "key": "pipelineTrigger",
      "displayName": "Trigger Bitbucket Pipeline",
      "description": "Trigger a pipeline.",
      "method": "POST",
      "path": "/repositories/{workspace}/{repoSlug}/pipelines",
      "mutating": true,
      "required": [
        "workspace",
        "repoSlug"
      ],
      "queryParams": [],
      "bodyParam": "pipeline"
    }
  ]
};
