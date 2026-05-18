import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.grafana",
  "packageName": "@kesarcloud/plugin-grafana",
  "version": "0.1.0",
  "displayName": "Grafana",
  "routePath": "grafana",
  "description": "Connects PaperClaw agents to Grafana HTTP APIs for dashboards, folders, datasources, alerts, annotations, and service accounts.",
  "apiBaseUrl": "https://grafana.example.com",
  "tokenLabel": "Grafana Service Account Token",
  "oauthLabel": "Grafana OAuth",
  "connectedLabel": "Grafana Instance",
  "apiBaseUrlLabel": "Grafana Instance Base URL",
  "defaultScopes": [
    "dashboards:read",
    "dashboards:write",
    "datasources:read"
  ],
  "rawPathPrefixes": [
    "/api/"
  ],
  "endpoints": [
    {
      "key": "search",
      "displayName": "Search Grafana",
      "description": "Search dashboards and folders.",
      "method": "GET",
      "path": "/api/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "query",
        "type",
        "folderIds"
      ]
    },
    {
      "key": "dashboardGet",
      "displayName": "Get Grafana Dashboard",
      "description": "Get dashboard by UID.",
      "method": "GET",
      "path": "/api/dashboards/uid/{dashboardUid}",
      "mutating": false,
      "required": [
        "dashboardUid"
      ],
      "queryParams": []
    },
    {
      "key": "dashboardCreateOrUpdate",
      "displayName": "Create or Update Grafana Dashboard",
      "description": "Create or update dashboard.",
      "method": "POST",
      "path": "/api/dashboards/db",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "dashboard"
    },
    {
      "key": "foldersList",
      "displayName": "List Grafana Folders",
      "description": "List folders.",
      "method": "GET",
      "path": "/api/folders",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "page"
      ]
    },
    {
      "key": "folderCreate",
      "displayName": "Create Grafana Folder",
      "description": "Create a folder.",
      "method": "POST",
      "path": "/api/folders",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "folder"
    },
    {
      "key": "datasourcesList",
      "displayName": "List Grafana Datasources",
      "description": "List datasources.",
      "method": "GET",
      "path": "/api/datasources",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "annotationsList",
      "displayName": "List Grafana Annotations",
      "description": "List annotations.",
      "method": "GET",
      "path": "/api/annotations",
      "mutating": false,
      "required": [],
      "queryParams": [
        "from",
        "to",
        "dashboardId",
        "panelId"
      ]
    },
    {
      "key": "annotationCreate",
      "displayName": "Create Grafana Annotation",
      "description": "Create an annotation.",
      "method": "POST",
      "path": "/api/annotations",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "annotation"
    }
  ]
};
