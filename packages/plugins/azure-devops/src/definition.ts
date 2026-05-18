import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.azure-devops",
  "packageName": "@kesarcloud/plugin-azure-devops",
  "version": "0.1.0",
  "displayName": "Azure DevOps",
  "routePath": "azure-devops",
  "description": "Connects PaperClaw agents to Azure DevOps for projects, repositories, work items, pull requests, builds, releases, and pipelines.",
  "apiBaseUrl": "https://dev.azure.com",
  "tokenLabel": "Azure DevOps PAT",
  "oauthLabel": "Azure DevOps OAuth",
  "connectedLabel": "Organization",
  "authScheme": "basic",
  "defaultScopes": [
    "vso.code",
    "vso.work",
    "vso.build"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "projectsList",
      "displayName": "List Azure DevOps Projects",
      "description": "List projects.",
      "method": "GET",
      "path": "/{organization}/_apis/projects",
      "mutating": false,
      "required": [
        "organization"
      ],
      "queryParams": [
        "api-version",
        "$top",
        "continuationToken"
      ]
    },
    {
      "key": "repositoriesList",
      "displayName": "List Azure Repositories",
      "description": "List Git repositories.",
      "method": "GET",
      "path": "/{organization}/{project}/_apis/git/repositories",
      "mutating": false,
      "required": [
        "organization",
        "project"
      ],
      "queryParams": [
        "api-version"
      ]
    },
    {
      "key": "pullRequestsList",
      "displayName": "List Azure Pull Requests",
      "description": "List pull requests.",
      "method": "GET",
      "path": "/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullrequests",
      "mutating": false,
      "required": [
        "organization",
        "project",
        "repositoryId"
      ],
      "queryParams": [
        "api-version",
        "searchCriteria.status"
      ]
    },
    {
      "key": "pullRequestCreate",
      "displayName": "Create Azure Pull Request",
      "description": "Create a pull request.",
      "method": "POST",
      "path": "/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullrequests",
      "mutating": true,
      "required": [
        "organization",
        "project",
        "repositoryId"
      ],
      "queryParams": [
        "api-version"
      ],
      "bodyParam": "pullRequest"
    },
    {
      "key": "workItemGet",
      "displayName": "Get Azure Work Item",
      "description": "Get a work item.",
      "method": "GET",
      "path": "/{organization}/{project}/_apis/wit/workitems/{workItemId}",
      "mutating": false,
      "required": [
        "organization",
        "project",
        "workItemId"
      ],
      "queryParams": [
        "api-version",
        "$expand"
      ]
    },
    {
      "key": "workItemCreate",
      "displayName": "Create Azure Work Item",
      "description": "Create a work item.",
      "method": "POST",
      "path": "/{organization}/{project}/_apis/wit/workitems/{type}",
      "mutating": true,
      "required": [
        "organization",
        "project",
        "type"
      ],
      "queryParams": [
        "api-version"
      ],
      "bodyParam": "patch"
    },
    {
      "key": "buildsList",
      "displayName": "List Azure Builds",
      "description": "List builds.",
      "method": "GET",
      "path": "/{organization}/{project}/_apis/build/builds",
      "mutating": false,
      "required": [
        "organization",
        "project"
      ],
      "queryParams": [
        "api-version",
        "statusFilter",
        "resultFilter"
      ]
    },
    {
      "key": "buildQueue",
      "displayName": "Queue Azure Build",
      "description": "Queue a build.",
      "method": "POST",
      "path": "/{organization}/{project}/_apis/build/builds",
      "mutating": true,
      "required": [
        "organization",
        "project"
      ],
      "queryParams": [
        "api-version"
      ],
      "bodyParam": "build"
    }
  ]
};
