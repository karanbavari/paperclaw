import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.lofty",
  "packageName": "@kesarcloud/plugin-lofty",
  "version": "0.1.0",
  "displayName": "Lofty",
  "routePath": "lofty",
  "description": "Connects PaperClaw agents to Lofty real-estate CRM APIs for leads, properties, tasks, activities, and agent workflows.",
  "apiBaseUrl": "https://api.lofty.com/v1",
  "tokenLabel": "Lofty Access Token",
  "oauthLabel": "Lofty OAuth",
  "connectedLabel": "Connected Lofty Account",
  "authScheme": "bearer",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "leadsList",
      "displayName": "List Lofty Leads",
      "description": "List leads.",
      "method": "GET",
      "path": "/leads",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "limit",
        "email",
        "phone",
        "status"
      ]
    },
    {
      "key": "leadGet",
      "displayName": "Get Lofty Lead",
      "description": "Get a lead.",
      "method": "GET",
      "path": "/leads/{leadId}",
      "mutating": false,
      "required": [
        "leadId"
      ],
      "queryParams": []
    },
    {
      "key": "leadCreate",
      "displayName": "Create Lofty Lead",
      "description": "Create a lead.",
      "method": "POST",
      "path": "/leads",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "lead"
    },
    {
      "key": "propertiesList",
      "displayName": "List Lofty Properties",
      "description": "List CRM properties.",
      "method": "GET",
      "path": "/properties",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "limit",
        "city",
        "state"
      ]
    },
    {
      "key": "tasksList",
      "displayName": "List Lofty Tasks",
      "description": "List tasks.",
      "method": "GET",
      "path": "/tasks",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "limit",
        "leadId"
      ]
    },
    {
      "key": "activityCreate",
      "displayName": "Create Lofty Activity",
      "description": "Create an activity.",
      "method": "POST",
      "path": "/activities",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "activity"
    }
  ]
};
