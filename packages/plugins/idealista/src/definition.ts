import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.idealista",
  "packageName": "@kesarcloud/plugin-idealista",
  "version": "0.1.0",
  "displayName": "Idealista",
  "routePath": "idealista",
  "description": "Connects PaperClaw agents to Idealista APIs for Spain, Italy, and Portugal property search and detail workflows.",
  "apiBaseUrl": "https://api.idealista.com/3.5",
  "tokenUrl": "https://api.idealista.com/oauth/token",
  "tokenAuthStyle": "basic",
  "tokenLabel": "Idealista Access Token",
  "oauthLabel": "Idealista OAuth",
  "connectedLabel": "Connected Idealista Account",
  "authScheme": "bearer",
  "defaultScopes": [
    "read"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "spainSearch",
      "displayName": "Search Spain Listings",
      "description": "Search Spain property listings.",
      "method": "POST",
      "path": "/es/search",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "search"
    },
    {
      "key": "italySearch",
      "displayName": "Search Italy Listings",
      "description": "Search Italy property listings.",
      "method": "POST",
      "path": "/it/search",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "search"
    },
    {
      "key": "portugalSearch",
      "displayName": "Search Portugal Listings",
      "description": "Search Portugal property listings.",
      "method": "POST",
      "path": "/pt/search",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "search"
    },
    {
      "key": "propertyGet",
      "displayName": "Get Idealista Property",
      "description": "Get property details.",
      "method": "GET",
      "path": "/properties/{propertyCode}",
      "mutating": false,
      "required": [
        "propertyCode"
      ],
      "queryParams": []
    }
  ]
};
