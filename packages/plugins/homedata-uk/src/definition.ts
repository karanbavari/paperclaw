import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.homedata-uk",
  "packageName": "@kesarcloud/plugin-homedata-uk",
  "version": "0.1.0",
  "displayName": "Homedata UK",
  "routePath": "homedata-uk",
  "description": "Connects PaperClaw agents to Homedata UK for residential property, valuation, planning, and local market data.",
  "apiBaseUrl": "https://api.homedata.co.uk",
  "tokenLabel": "Homedata API Key",
  "oauthLabel": "Homedata UK OAuth",
  "connectedLabel": "Connected Homedata UK Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "x-api-key",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "propertiesSearch",
      "displayName": "Search Homedata Properties",
      "description": "Search UK properties.",
      "method": "GET",
      "path": "/properties/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "postcode",
        "address",
        "uprn",
        "limit"
      ]
    },
    {
      "key": "propertyGet",
      "displayName": "Get Homedata Property",
      "description": "Get property by UPRN.",
      "method": "GET",
      "path": "/properties/{uprn}",
      "mutating": false,
      "required": [
        "uprn"
      ],
      "queryParams": []
    },
    {
      "key": "valuationGet",
      "displayName": "Get Homedata Valuation",
      "description": "Get valuation estimate.",
      "method": "GET",
      "path": "/valuation",
      "mutating": false,
      "required": [],
      "queryParams": [
        "uprn",
        "postcode",
        "address"
      ]
    },
    {
      "key": "planningSearch",
      "displayName": "Search Planning Data",
      "description": "Search planning records.",
      "method": "GET",
      "path": "/planning/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "postcode",
        "uprn",
        "radius"
      ]
    },
    {
      "key": "marketStats",
      "displayName": "Get Market Stats",
      "description": "Get local market statistics.",
      "method": "GET",
      "path": "/market/stats",
      "mutating": false,
      "required": [],
      "queryParams": [
        "postcode",
        "area",
        "propertyType"
      ]
    }
  ]
};
