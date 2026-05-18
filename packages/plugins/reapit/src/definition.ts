import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.reapit",
  "packageName": "@kesarcloud/plugin-reapit",
  "version": "0.1.0",
  "displayName": "Reapit Foundations",
  "routePath": "reapit",
  "description": "Connects PaperClaw agents to Reapit Foundations for UK agency properties, applicants, contacts, appointments, and offers.",
  "apiBaseUrl": "https://platform.reapit.cloud",
  "authUrl": "https://connect.reapit.cloud/authorize",
  "tokenUrl": "https://connect.reapit.cloud/token",
  "tokenAuthStyle": "basic",
  "tokenLabel": "Reapit Access Token",
  "oauthLabel": "Reapit Connect OAuth",
  "connectedLabel": "Reapit Customer ID",
  "connectedAccountHeaderName": "reapit-customer",
  "defaultScopes": [
    "agencyCloud/properties.read",
    "agencyCloud/applicants.read",
    "agencyCloud/contacts.read",
    "agencyCloud/contacts.write"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "propertiesList",
      "displayName": "List Reapit Properties",
      "description": "List agency properties.",
      "method": "GET",
      "path": "/properties",
      "mutating": false,
      "required": [],
      "queryParams": [
        "pageSize",
        "pageNumber",
        "sellingStatus",
        "lettingStatus",
        "address"
      ]
    },
    {
      "key": "propertyGet",
      "displayName": "Get Reapit Property",
      "description": "Get a property.",
      "method": "GET",
      "path": "/properties/{propertyId}",
      "mutating": false,
      "required": [
        "propertyId"
      ],
      "queryParams": []
    },
    {
      "key": "applicantsList",
      "displayName": "List Reapit Applicants",
      "description": "List applicants.",
      "method": "GET",
      "path": "/applicants",
      "mutating": false,
      "required": [],
      "queryParams": [
        "pageSize",
        "pageNumber",
        "active"
      ]
    },
    {
      "key": "contactsList",
      "displayName": "List Reapit Contacts",
      "description": "List contacts.",
      "method": "GET",
      "path": "/contacts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "pageSize",
        "pageNumber",
        "name"
      ]
    },
    {
      "key": "contactCreate",
      "displayName": "Create Reapit Contact",
      "description": "Create a contact.",
      "method": "POST",
      "path": "/contacts",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "contact"
    },
    {
      "key": "appointmentsList",
      "displayName": "List Reapit Appointments",
      "description": "List appointments.",
      "method": "GET",
      "path": "/appointments",
      "mutating": false,
      "required": [],
      "queryParams": [
        "pageSize",
        "pageNumber",
        "propertyId"
      ]
    },
    {
      "key": "offersList",
      "displayName": "List Reapit Offers",
      "description": "List offers.",
      "method": "GET",
      "path": "/offers",
      "mutating": false,
      "required": [],
      "queryParams": [
        "pageSize",
        "pageNumber",
        "propertyId"
      ]
    }
  ]
};
