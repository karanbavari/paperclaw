import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.webflow",
  "packageName": "@kesarcloud/plugin-webflow",
  "version": "0.1.0",
  "displayName": "Webflow",
  "routePath": "webflow",
  "description": "Connects PaperClaw agents to Webflow for sites, pages, collections, items, assets, forms, and publish workflows.",
  "apiBaseUrl": "https://api.webflow.com",
  "authUrl": "https://webflow.com/oauth/authorize",
  "tokenUrl": "https://api.webflow.com/oauth/access_token",
  "tokenLabel": "Webflow API Token",
  "oauthLabel": "Webflow OAuth",
  "connectedLabel": "Site ID",
  "defaultScopes": [
    "sites:read",
    "sites:write",
    "cms:read",
    "cms:write",
    "assets:read",
    "assets:write"
  ],
  "rawPathPrefixes": [
    "/v2/"
  ],
  "endpoints": [
    {
      "key": "sitesList",
      "displayName": "List Webflow Sites",
      "description": "List sites.",
      "method": "GET",
      "path": "/v2/sites",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "siteGet",
      "displayName": "Get Webflow Site",
      "description": "Get a site.",
      "method": "GET",
      "path": "/v2/sites/{siteId}",
      "mutating": false,
      "required": [
        "siteId"
      ],
      "queryParams": []
    },
    {
      "key": "pagesList",
      "displayName": "List Webflow Pages",
      "description": "List pages.",
      "method": "GET",
      "path": "/v2/sites/{siteId}/pages",
      "mutating": false,
      "required": [
        "siteId"
      ],
      "queryParams": [
        "limit",
        "offset"
      ]
    },
    {
      "key": "collectionsList",
      "displayName": "List Webflow Collections",
      "description": "List collections.",
      "method": "GET",
      "path": "/v2/sites/{siteId}/collections",
      "mutating": false,
      "required": [
        "siteId"
      ],
      "queryParams": []
    },
    {
      "key": "itemsList",
      "displayName": "List Webflow Collection Items",
      "description": "List collection items.",
      "method": "GET",
      "path": "/v2/collections/{collectionId}/items",
      "mutating": false,
      "required": [
        "collectionId"
      ],
      "queryParams": [
        "limit",
        "offset"
      ]
    },
    {
      "key": "itemCreate",
      "displayName": "Create Webflow Collection Item",
      "description": "Create a collection item.",
      "method": "POST",
      "path": "/v2/collections/{collectionId}/items",
      "mutating": true,
      "required": [
        "collectionId"
      ],
      "queryParams": [],
      "bodyParam": "item"
    },
    {
      "key": "itemUpdate",
      "displayName": "Update Webflow Collection Item",
      "description": "Update a collection item.",
      "method": "PATCH",
      "path": "/v2/collections/{collectionId}/items/{itemId}",
      "mutating": true,
      "required": [
        "collectionId",
        "itemId"
      ],
      "queryParams": [],
      "bodyParam": "item"
    },
    {
      "key": "sitePublish",
      "displayName": "Publish Webflow Site",
      "description": "Publish a site.",
      "method": "POST",
      "path": "/v2/sites/{siteId}/publish",
      "mutating": true,
      "required": [
        "siteId"
      ],
      "queryParams": [],
      "bodyParam": "publish"
    }
  ]
};
