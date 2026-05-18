import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.sonarcloud",
  "packageName": "@kesarcloud/plugin-sonarcloud",
  "version": "0.1.0",
  "displayName": "SonarCloud",
  "routePath": "sonarcloud",
  "description": "Connects PaperClaw agents to SonarCloud Web APIs for projects, issues, quality gates, measures, components, and analysis status.",
  "apiBaseUrl": "https://sonarcloud.io",
  "tokenLabel": "SonarCloud Token",
  "oauthLabel": "SonarCloud OAuth",
  "connectedLabel": "Organization",
  "authScheme": "basic",
  "defaultScopes": [
    "projects",
    "issues",
    "measures"
  ],
  "rawPathPrefixes": [
    "/api/"
  ],
  "endpoints": [
    {
      "key": "projectsSearch",
      "displayName": "Search SonarCloud Projects",
      "description": "Search projects.",
      "method": "GET",
      "path": "/api/projects/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "organization",
        "q",
        "p",
        "ps"
      ]
    },
    {
      "key": "issuesSearch",
      "displayName": "Search SonarCloud Issues",
      "description": "Search issues.",
      "method": "GET",
      "path": "/api/issues/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "organization",
        "projects",
        "severities",
        "statuses",
        "p",
        "ps"
      ]
    },
    {
      "key": "issueTransition",
      "displayName": "Transition SonarCloud Issue",
      "description": "Apply an issue transition.",
      "method": "POST",
      "path": "/api/issues/do_transition",
      "mutating": true,
      "required": [],
      "queryParams": [
        "issue",
        "transition"
      ]
    },
    {
      "key": "qualityGateStatus",
      "displayName": "Get SonarCloud Quality Gate",
      "description": "Get quality gate status.",
      "method": "GET",
      "path": "/api/qualitygates/project_status",
      "mutating": false,
      "required": [],
      "queryParams": [
        "projectKey",
        "branch",
        "pullRequest"
      ]
    },
    {
      "key": "measuresComponent",
      "displayName": "Get SonarCloud Measures",
      "description": "Get component measures.",
      "method": "GET",
      "path": "/api/measures/component",
      "mutating": false,
      "required": [],
      "queryParams": [
        "component",
        "metricKeys",
        "branch",
        "pullRequest"
      ]
    },
    {
      "key": "componentsTree",
      "displayName": "List SonarCloud Components",
      "description": "List component tree.",
      "method": "GET",
      "path": "/api/components/tree",
      "mutating": false,
      "required": [],
      "queryParams": [
        "component",
        "qualifiers",
        "p",
        "ps"
      ]
    },
    {
      "key": "projectAnalysesSearch",
      "displayName": "Search SonarCloud Analyses",
      "description": "Search analyses.",
      "method": "GET",
      "path": "/api/project_analyses/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "project",
        "branch",
        "p",
        "ps"
      ]
    }
  ]
};
