import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.rentcast",
  "packageName": "@kesarcloud/plugin-rentcast",
  "version": "0.1.0",
  "displayName": "RentCast",
  "routePath": "rentcast",
  "description": "Connects PaperClaw agents to RentCast for US property records, sale/rental listings, AVM values, and market data.",
  "apiBaseUrl": "https://api.rentcast.io/v1",
  "tokenLabel": "RentCast API Key",
  "oauthLabel": "RentCast OAuth",
  "connectedLabel": "Connected RentCast Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "X-Api-Key",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "propertiesSearch",
      "displayName": "Search RentCast Properties",
      "description": "Search property records.",
      "method": "GET",
      "path": "/properties",
      "mutating": false,
      "required": [],
      "queryParams": [
        "address",
        "city",
        "state",
        "zipCode",
        "limit"
      ]
    },
    {
      "key": "propertyGet",
      "displayName": "Get RentCast Property",
      "description": "Get a property record.",
      "method": "GET",
      "path": "/properties/{propertyId}",
      "mutating": false,
      "required": [
        "propertyId"
      ],
      "queryParams": []
    },
    {
      "key": "saleListingsSearch",
      "displayName": "Search Sale Listings",
      "description": "Search active sale listings.",
      "method": "GET",
      "path": "/listings/sale",
      "mutating": false,
      "required": [],
      "queryParams": [
        "city",
        "state",
        "zipCode",
        "limit",
        "status"
      ]
    },
    {
      "key": "rentalListingsSearch",
      "displayName": "Search Rental Listings",
      "description": "Search active rental listings.",
      "method": "GET",
      "path": "/listings/rental",
      "mutating": false,
      "required": [],
      "queryParams": [
        "city",
        "state",
        "zipCode",
        "limit",
        "status"
      ]
    },
    {
      "key": "avmValue",
      "displayName": "Get AVM Value",
      "description": "Estimate property value.",
      "method": "GET",
      "path": "/avm/value",
      "mutating": false,
      "required": [],
      "queryParams": [
        "address",
        "city",
        "state",
        "zipCode"
      ]
    },
    {
      "key": "marketsSearch",
      "displayName": "Search Market Data",
      "description": "Search market statistics.",
      "method": "GET",
      "path": "/markets",
      "mutating": false,
      "required": [],
      "queryParams": [
        "city",
        "state",
        "zipCode"
      ]
    }
  ]
};
