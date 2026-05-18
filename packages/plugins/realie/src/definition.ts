import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.realie",
  "packageName": "@kesarcloud/plugin-realie",
  "version": "0.1.0",
  "displayName": "Realie",
  "routePath": "realie",
  "description": "Connects PaperClaw agents to Realie AI for property intelligence, comparable properties, and real-estate data enrichment.",
  "apiBaseUrl": "https://api.realie.ai",
  "tokenLabel": "Realie API Key",
  "oauthLabel": "Realie OAuth",
  "connectedLabel": "Connected Realie Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "propertiesSearch",
      "displayName": "Search Realie Properties",
      "description": "Search property intelligence records.",
      "method": "GET",
      "path": "/v1/properties/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "query",
        "city",
        "state",
        "country",
        "limit"
      ]
    },
    {
      "key": "propertyGet",
      "displayName": "Get Realie Property",
      "description": "Get property detail.",
      "method": "GET",
      "path": "/v1/properties/{propertyId}",
      "mutating": false,
      "required": [
        "propertyId"
      ],
      "queryParams": []
    },
    {
      "key": "comparablesSearch",
      "displayName": "Search Comparables",
      "description": "Find comparable properties.",
      "method": "GET",
      "path": "/v1/comparables",
      "mutating": false,
      "required": [],
      "queryParams": [
        "propertyId",
        "address",
        "radius",
        "limit"
      ]
    },
    {
      "key": "valuationGet",
      "displayName": "Get Property Valuation",
      "description": "Request property valuation intelligence.",
      "method": "GET",
      "path": "/v1/valuations",
      "mutating": false,
      "required": [],
      "queryParams": [
        "propertyId",
        "address"
      ]
    },
    {
      "key": "enrichmentCreate",
      "displayName": "Create Enrichment Request",
      "description": "Prepare a property enrichment request.",
      "method": "POST",
      "path": "/v1/enrichments",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "enrichment"
    }
  ]
};
