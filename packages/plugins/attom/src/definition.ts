import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.attom",
  "packageName": "@kesarcloud/plugin-attom",
  "version": "0.1.0",
  "displayName": "ATTOM",
  "routePath": "attom",
  "description": "Connects PaperClaw agents to ATTOM property data for US property profiles, sales, valuation, and assessment workflows.",
  "apiBaseUrl": "https://api.gateway.attomdata.com/propertyapi/v1.0.0",
  "tokenLabel": "ATTOM API Key",
  "oauthLabel": "ATTOM OAuth",
  "connectedLabel": "Connected ATTOM Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "apikey",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "propertyByAddress",
      "displayName": "Get Property By Address",
      "description": "Lookup property by address.",
      "method": "GET",
      "path": "/property/address",
      "mutating": false,
      "required": [],
      "queryParams": [
        "address1",
        "address2"
      ]
    },
    {
      "key": "basicProfile",
      "displayName": "Get Basic Profile",
      "description": "Get basic property profile.",
      "method": "GET",
      "path": "/property/basicprofile",
      "mutating": false,
      "required": [],
      "queryParams": [
        "address1",
        "address2",
        "attomid"
      ]
    },
    {
      "key": "detailProfile",
      "displayName": "Get Detail Profile",
      "description": "Get detailed property profile.",
      "method": "GET",
      "path": "/property/detail",
      "mutating": false,
      "required": [],
      "queryParams": [
        "address1",
        "address2",
        "attomid"
      ]
    },
    {
      "key": "expandedProfile",
      "displayName": "Get Expanded Profile",
      "description": "Get expanded property profile.",
      "method": "GET",
      "path": "/property/expandedprofile",
      "mutating": false,
      "required": [],
      "queryParams": [
        "address1",
        "address2",
        "attomid"
      ]
    },
    {
      "key": "saleSnapshot",
      "displayName": "Get Sale Snapshot",
      "description": "Get sales snapshot.",
      "method": "GET",
      "path": "/sale/snapshot",
      "mutating": false,
      "required": [],
      "queryParams": [
        "address1",
        "address2",
        "attomid"
      ]
    },
    {
      "key": "assessmentSnapshot",
      "displayName": "Get Assessment Snapshot",
      "description": "Get assessment snapshot.",
      "method": "GET",
      "path": "/assessment/snapshot",
      "mutating": false,
      "required": [],
      "queryParams": [
        "address1",
        "address2",
        "attomid"
      ]
    }
  ]
};
