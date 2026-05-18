import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.browserstack",
  "packageName": "@kesarcloud/plugin-browserstack",
  "version": "0.1.0",
  "displayName": "BrowserStack",
  "routePath": "browserstack",
  "description": "Connects PaperClaw agents to BrowserStack for browser/device capability discovery, sessions, builds, projects, app uploads, and test observability.",
  "apiBaseUrl": "https://api.browserstack.com",
  "tokenLabel": "BrowserStack Basic Token",
  "oauthLabel": "BrowserStack OAuth",
  "connectedLabel": "Group or Project ID",
  "authScheme": "basic",
  "defaultScopes": [
    "automate",
    "app-automate",
    "test-observability"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "browsersList",
      "displayName": "List BrowserStack Browsers",
      "description": "List Automate browsers.",
      "method": "GET",
      "path": "/automate/browsers.json",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "projectsList",
      "displayName": "List BrowserStack Projects",
      "description": "List projects.",
      "method": "GET",
      "path": "/automate/projects.json",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "buildsList",
      "displayName": "List BrowserStack Builds",
      "description": "List builds.",
      "method": "GET",
      "path": "/automate/builds.json",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "status"
      ]
    },
    {
      "key": "sessionsList",
      "displayName": "List BrowserStack Sessions",
      "description": "List sessions for a build.",
      "method": "GET",
      "path": "/automate/builds/{buildId}/sessions.json",
      "mutating": false,
      "required": [
        "buildId"
      ],
      "queryParams": [
        "limit",
        "offset"
      ]
    },
    {
      "key": "sessionGet",
      "displayName": "Get BrowserStack Session",
      "description": "Get session details.",
      "method": "GET",
      "path": "/automate/sessions/{sessionId}.json",
      "mutating": false,
      "required": [
        "sessionId"
      ],
      "queryParams": []
    },
    {
      "key": "sessionUpdate",
      "displayName": "Update BrowserStack Session",
      "description": "Update session status metadata.",
      "method": "PUT",
      "path": "/automate/sessions/{sessionId}.json",
      "mutating": true,
      "required": [
        "sessionId"
      ],
      "queryParams": [],
      "bodyParam": "session"
    },
    {
      "key": "appUpload",
      "displayName": "Upload BrowserStack App",
      "description": "Upload app metadata through App Automate.",
      "method": "POST",
      "path": "/app-automate/upload",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "app"
    },
    {
      "key": "devicesList",
      "displayName": "List BrowserStack Devices",
      "description": "List App Automate devices.",
      "method": "GET",
      "path": "/app-automate/devices.json",
      "mutating": false,
      "required": [],
      "queryParams": []
    }
  ]
};
