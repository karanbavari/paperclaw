import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.geoiq",
  "packageName": "@kesarcloud/plugin-geoiq",
  "version": "0.1.0",
  "displayName": "GeoIQ",
  "routePath": "geoiq",
  "description": "Connects PaperClaw agents to GeoIQ for Indian location intelligence, catchment analysis, scores, and geospatial enrichment.",
  "apiBaseUrl": "https://api.geoiq.io",
  "tokenLabel": "GeoIQ API Key",
  "oauthLabel": "GeoIQ OAuth",
  "connectedLabel": "Connected GeoIQ Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "x-api-key",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "placesSearch",
      "displayName": "Search GeoIQ Places",
      "description": "Search places and addresses.",
      "method": "GET",
      "path": "/v1/places/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "query",
        "city",
        "state",
        "limit"
      ]
    },
    {
      "key": "placeGet",
      "displayName": "Get GeoIQ Place",
      "description": "Get place detail.",
      "method": "GET",
      "path": "/v1/places/{placeId}",
      "mutating": false,
      "required": [
        "placeId"
      ],
      "queryParams": []
    },
    {
      "key": "areaInsights",
      "displayName": "Get Area Insights",
      "description": "Get area insight data.",
      "method": "GET",
      "path": "/v1/insights/area",
      "mutating": false,
      "required": [],
      "queryParams": [
        "lat",
        "lng",
        "radius",
        "pincode"
      ]
    },
    {
      "key": "scoreGet",
      "displayName": "Get GeoIQ Score",
      "description": "Get location score.",
      "method": "GET",
      "path": "/v1/score",
      "mutating": false,
      "required": [],
      "queryParams": [
        "lat",
        "lng",
        "pincode",
        "scoreType"
      ]
    },
    {
      "key": "polygonSearch",
      "displayName": "Search Polygons",
      "description": "Search administrative and catchment polygons.",
      "method": "GET",
      "path": "/v1/polygons/search",
      "mutating": false,
      "required": [],
      "queryParams": [
        "query",
        "type",
        "limit"
      ]
    }
  ]
};
