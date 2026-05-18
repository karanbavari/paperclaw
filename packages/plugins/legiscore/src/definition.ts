import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.legiscore",
  "packageName": "@kesarcloud/plugin-legiscore",
  "version": "0.1.0",
  "displayName": "LegiScore",
  "routePath": "legiscore",
  "description": "Connects PaperClaw agents to LegiScore for Indian property due diligence, title, ownership, encumbrance, and compliance data workflows.",
  "apiBaseUrl": "https://api.legiscore.in",
  "tokenLabel": "LegiScore API Key",
  "oauthLabel": "LegiScore OAuth",
  "connectedLabel": "Connected LegiScore Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "x-api-key",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "titleSearch",
      "displayName": "Search Property Title",
      "description": "Search property title records.",
      "method": "GET",
      "path": "/v1/title/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "state",
        "district",
        "surveyNumber",
        "ownerName"
      ]
    },
    {
      "key": "propertyGet",
      "displayName": "Get Property Diligence",
      "description": "Get property diligence record.",
      "method": "GET",
      "path": "/v1/properties/{propertyId}",
      "mutating": false,
      "required": [
        "propertyId"
      ],
      "queryParams": []
    },
    {
      "key": "encumbranceSearch",
      "displayName": "Search Encumbrances",
      "description": "Search encumbrance records.",
      "method": "GET",
      "path": "/v1/encumbrances/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "propertyId",
        "state",
        "district"
      ]
    },
    {
      "key": "ownershipSearch",
      "displayName": "Search Ownership",
      "description": "Search ownership records.",
      "method": "GET",
      "path": "/v1/ownership/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "ownerName",
        "state",
        "district"
      ]
    },
    {
      "key": "reportCreate",
      "displayName": "Create Diligence Report",
      "description": "Prepare a diligence report request.",
      "method": "POST",
      "path": "/v1/reports",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "report"
    }
  ]
};
