import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.hm-land-registry",
  "packageName": "@kesarcloud/plugin-hm-land-registry",
  "version": "0.1.0",
  "displayName": "HM Land Registry",
  "routePath": "hm-land-registry",
  "description": "Connects PaperClaw agents to HM Land Registry land and property data APIs for title, price paid, and ownership workflows.",
  "apiBaseUrl": "https://use-land-property-data.service.gov.uk/api",
  "tokenLabel": "HM Land Registry API Key",
  "oauthLabel": "HM Land Registry OAuth",
  "connectedLabel": "Connected HM Land Registry Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "Authorization",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "pricePaidSearch",
      "displayName": "Search Price Paid Data",
      "description": "Search price paid records.",
      "method": "GET",
      "path": "/price-paid-data",
      "mutating": false,
      "required": [],
      "queryParams": [
        "postcode",
        "paon",
        "saon",
        "street",
        "town",
        "county"
      ]
    },
    {
      "key": "titleSummary",
      "displayName": "Get Title Summary",
      "description": "Get title summary by title number.",
      "method": "GET",
      "path": "/titles/{titleNumber}",
      "mutating": false,
      "required": [
        "titleNumber"
      ],
      "queryParams": []
    },
    {
      "key": "ownershipSearch",
      "displayName": "Search Ownership Data",
      "description": "Search ownership records.",
      "method": "GET",
      "path": "/ownership",
      "mutating": false,
      "required": [],
      "queryParams": [
        "postcode",
        "titleNumber",
        "address"
      ]
    },
    {
      "key": "propertyDescription",
      "displayName": "Get Property Description",
      "description": "Get registered property description.",
      "method": "GET",
      "path": "/property-description",
      "mutating": false,
      "required": [],
      "queryParams": [
        "titleNumber",
        "postcode"
      ]
    }
  ]
};
