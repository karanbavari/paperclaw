import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.digitalocean",
  "packageName": "@kesarcloud/plugin-digitalocean",
  "version": "0.1.0",
  "displayName": "DigitalOcean",
  "routePath": "digitalocean",
  "description": "Connects PaperClaw agents to DigitalOcean for apps, droplets, databases, domains, Kubernetes clusters, images, and projects.",
  "apiBaseUrl": "https://api.digitalocean.com/v2",
  "tokenLabel": "DigitalOcean API Token",
  "oauthLabel": "DigitalOcean OAuth",
  "connectedLabel": "Team or Project ID",
  "defaultScopes": [
    "read",
    "write"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "appsList",
      "displayName": "List DigitalOcean Apps",
      "description": "List App Platform apps.",
      "method": "GET",
      "path": "/apps",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "per_page"
      ]
    },
    {
      "key": "appCreate",
      "displayName": "Create DigitalOcean App",
      "description": "Create an app.",
      "method": "POST",
      "path": "/apps",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "app"
    },
    {
      "key": "appDeploymentsList",
      "displayName": "List DigitalOcean App Deployments",
      "description": "List app deployments.",
      "method": "GET",
      "path": "/apps/{appId}/deployments",
      "mutating": false,
      "required": [
        "appId"
      ],
      "queryParams": [
        "page",
        "per_page"
      ]
    },
    {
      "key": "appDeploymentCreate",
      "displayName": "Create DigitalOcean App Deployment",
      "description": "Create an app deployment.",
      "method": "POST",
      "path": "/apps/{appId}/deployments",
      "mutating": true,
      "required": [
        "appId"
      ],
      "queryParams": [],
      "bodyParam": "deployment"
    },
    {
      "key": "dropletsList",
      "displayName": "List DigitalOcean Droplets",
      "description": "List droplets.",
      "method": "GET",
      "path": "/droplets",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "per_page",
        "tag_name"
      ]
    },
    {
      "key": "databasesList",
      "displayName": "List DigitalOcean Databases",
      "description": "List database clusters.",
      "method": "GET",
      "path": "/databases",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "per_page"
      ]
    },
    {
      "key": "domainsList",
      "displayName": "List DigitalOcean Domains",
      "description": "List domains.",
      "method": "GET",
      "path": "/domains",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "per_page"
      ]
    },
    {
      "key": "kubernetesClustersList",
      "displayName": "List DigitalOcean Kubernetes Clusters",
      "description": "List Kubernetes clusters.",
      "method": "GET",
      "path": "/kubernetes/clusters",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "per_page"
      ]
    }
  ]
};
