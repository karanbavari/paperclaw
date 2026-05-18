import type { RealEstateDefinition } from "@kesarcloud/plugin-real-estate-core";

export const definition: RealEstateDefinition = {
  "id": "paperclaw.follow-up-boss",
  "packageName": "@kesarcloud/plugin-follow-up-boss",
  "version": "0.1.0",
  "displayName": "Follow Up Boss",
  "routePath": "follow-up-boss",
  "description": "Connects PaperClaw agents to Follow Up Boss for real-estate leads, people, events, notes, tasks, and CRM workflows.",
  "apiBaseUrl": "https://api.followupboss.com/v1",
  "tokenLabel": "Follow Up Boss API Key",
  "oauthLabel": "Follow Up Boss OAuth",
  "connectedLabel": "Connected Follow Up Boss Account",
  "authScheme": "basic-token",
  "defaultScopes": [],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "peopleList",
      "displayName": "List Follow Up Boss People",
      "description": "List people and leads.",
      "method": "GET",
      "path": "/people",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "sort",
        "email",
        "phone"
      ]
    },
    {
      "key": "personGet",
      "displayName": "Get Follow Up Boss Person",
      "description": "Get a person.",
      "method": "GET",
      "path": "/people/{personId}",
      "mutating": false,
      "required": [
        "personId"
      ],
      "queryParams": []
    },
    {
      "key": "personCreate",
      "displayName": "Create Follow Up Boss Person",
      "description": "Create a person or lead.",
      "method": "POST",
      "path": "/people",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "person"
    },
    {
      "key": "eventsList",
      "displayName": "List Follow Up Boss Events",
      "description": "List events.",
      "method": "GET",
      "path": "/events",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "personId"
      ]
    },
    {
      "key": "tasksList",
      "displayName": "List Follow Up Boss Tasks",
      "description": "List tasks.",
      "method": "GET",
      "path": "/tasks",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "personId"
      ]
    },
    {
      "key": "noteCreate",
      "displayName": "Create Follow Up Boss Note",
      "description": "Create a note.",
      "method": "POST",
      "path": "/notes",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "note"
    }
  ]
};
