import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.render",
  "packageName": "@kesarcloud/plugin-render",
  "version": "0.1.0",
  "displayName": "Render",
  "routePath": "render",
  "description": "Connects PaperClaw agents to Render for services, deploys, environment variables, custom domains, jobs, and service events.",
  "apiBaseUrl": "https://api.render.com/v1",
  "tokenLabel": "Render API Key",
  "oauthLabel": "Render OAuth",
  "connectedLabel": "Owner or Service ID",
  "defaultScopes": [
    "services",
    "deploys"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "servicesList",
      "displayName": "List Render Services",
      "description": "List services.",
      "method": "GET",
      "path": "/services",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "cursor",
        "name"
      ]
    },
    {
      "key": "serviceGet",
      "displayName": "Get Render Service",
      "description": "Get a service.",
      "method": "GET",
      "path": "/services/{serviceId}",
      "mutating": false,
      "required": [
        "serviceId"
      ],
      "queryParams": []
    },
    {
      "key": "deploysList",
      "displayName": "List Render Deploys",
      "description": "List deploys.",
      "method": "GET",
      "path": "/services/{serviceId}/deploys",
      "mutating": false,
      "required": [
        "serviceId"
      ],
      "queryParams": [
        "limit",
        "cursor"
      ]
    },
    {
      "key": "deployCreate",
      "displayName": "Create Render Deploy",
      "description": "Trigger a deploy.",
      "method": "POST",
      "path": "/services/{serviceId}/deploys",
      "mutating": true,
      "required": [
        "serviceId"
      ],
      "queryParams": [],
      "bodyParam": "deploy"
    },
    {
      "key": "envVarsList",
      "displayName": "List Render Env Vars",
      "description": "List environment variables.",
      "method": "GET",
      "path": "/services/{serviceId}/env-vars",
      "mutating": false,
      "required": [
        "serviceId"
      ],
      "queryParams": [
        "limit",
        "cursor"
      ]
    },
    {
      "key": "envVarUpdate",
      "displayName": "Update Render Env Var",
      "description": "Update environment variables.",
      "method": "PUT",
      "path": "/services/{serviceId}/env-vars/{envVarKey}",
      "mutating": true,
      "required": [
        "serviceId",
        "envVarKey"
      ],
      "queryParams": [],
      "bodyParam": "envVar"
    },
    {
      "key": "customDomainsList",
      "displayName": "List Render Custom Domains",
      "description": "List custom domains.",
      "method": "GET",
      "path": "/services/{serviceId}/custom-domains",
      "mutating": false,
      "required": [
        "serviceId"
      ],
      "queryParams": [
        "limit",
        "cursor"
      ]
    },
    {
      "key": "customDomainCreate",
      "displayName": "Create Render Custom Domain",
      "description": "Create a custom domain.",
      "method": "POST",
      "path": "/services/{serviceId}/custom-domains",
      "mutating": true,
      "required": [
        "serviceId"
      ],
      "queryParams": [],
      "bodyParam": "domain"
    }
  ]
};
