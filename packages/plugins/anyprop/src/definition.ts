import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.anyprop",
  "packageName": "@kesarcloud/plugin-anyprop",
  "version": "0.1.0",
  "displayName": "AnyProp RESO",
  "routePath": "anyprop",
  "description": "Connects PaperClaw agents to AnyProp RESO Web API compatible property, member, office, and metadata resources.",
  "apiBaseUrl": "https://api.anyprop.com",
  "tokenLabel": "AnyProp API Token",
  "oauthLabel": "AnyProp RESO OAuth",
  "connectedLabel": "Connected AnyProp RESO Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "propertiesList",
      "displayName": "List RESO Properties",
      "description": "List RESO Property resources.",
      "method": "GET",
      "path": "/reso/odata/Property",
      "mutating": false,
      "required": [],
      "queryParams": [
        "$top",
        "$skip",
        "$filter",
        "$select",
        "$orderby"
      ]
    },
    {
      "key": "propertyGet",
      "displayName": "Get RESO Property",
      "description": "Get RESO Property by listing key.",
      "method": "GET",
      "path": "/reso/odata/Property({listingKey})",
      "mutating": false,
      "required": [
        "listingKey"
      ],
      "queryParams": [
        "$select"
      ]
    },
    {
      "key": "membersList",
      "displayName": "List RESO Members",
      "description": "List RESO Member resources.",
      "method": "GET",
      "path": "/reso/odata/Member",
      "mutating": false,
      "required": [],
      "queryParams": [
        "$top",
        "$filter",
        "$select"
      ]
    },
    {
      "key": "officesList",
      "displayName": "List RESO Offices",
      "description": "List RESO Office resources.",
      "method": "GET",
      "path": "/reso/odata/Office",
      "mutating": false,
      "required": [],
      "queryParams": [
        "$top",
        "$filter",
        "$select"
      ]
    },
    {
      "key": "metadataGet",
      "displayName": "Get RESO Metadata",
      "description": "Get RESO metadata document.",
      "method": "GET",
      "path": "/reso/odata/$metadata",
      "mutating": false,
      "required": [],
      "queryParams": []
    }
  ]
};
