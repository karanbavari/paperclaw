import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";

export const definition: DeveloperDefinition = {
  "id": "paperclaw.cloudflare",
  "packageName": "@kesarcloud/plugin-cloudflare",
  "version": "0.1.0",
  "displayName": "Cloudflare",
  "routePath": "cloudflare",
  "description": "Connects PaperClaw agents to Cloudflare for accounts, zones, DNS, Workers, Pages, KV, R2, and firewall rules.",
  "apiBaseUrl": "https://api.cloudflare.com/client/v4",
  "tokenLabel": "Cloudflare API Token",
  "oauthLabel": "Cloudflare OAuth",
  "connectedLabel": "Account or Zone ID",
  "defaultScopes": [
    "account.read",
    "zone.read",
    "workers.write"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "accountsList",
      "displayName": "List Cloudflare Accounts",
      "description": "List accounts.",
      "method": "GET",
      "path": "/accounts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "per_page",
        "name"
      ]
    },
    {
      "key": "zonesList",
      "displayName": "List Cloudflare Zones",
      "description": "List zones.",
      "method": "GET",
      "path": "/zones",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "per_page",
        "name",
        "status"
      ]
    },
    {
      "key": "dnsRecordsList",
      "displayName": "List Cloudflare DNS Records",
      "description": "List DNS records.",
      "method": "GET",
      "path": "/zones/{zoneId}/dns_records",
      "mutating": false,
      "required": [
        "zoneId"
      ],
      "queryParams": [
        "page",
        "per_page",
        "type",
        "name"
      ]
    },
    {
      "key": "dnsRecordCreate",
      "displayName": "Create Cloudflare DNS Record",
      "description": "Create a DNS record.",
      "method": "POST",
      "path": "/zones/{zoneId}/dns_records",
      "mutating": true,
      "required": [
        "zoneId"
      ],
      "queryParams": [],
      "bodyParam": "record"
    },
    {
      "key": "workersScriptsList",
      "displayName": "List Cloudflare Workers",
      "description": "List Workers scripts.",
      "method": "GET",
      "path": "/accounts/{accountId}/workers/scripts",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": []
    },
    {
      "key": "workerScriptUpload",
      "displayName": "Upload Cloudflare Worker Script",
      "description": "Upload or replace a Worker script.",
      "method": "PUT",
      "path": "/accounts/{accountId}/workers/scripts/{scriptName}",
      "mutating": true,
      "required": [
        "accountId",
        "scriptName"
      ],
      "queryParams": [],
      "bodyParam": "script"
    },
    {
      "key": "pagesProjectsList",
      "displayName": "List Cloudflare Pages Projects",
      "description": "List Pages projects.",
      "method": "GET",
      "path": "/accounts/{accountId}/pages/projects",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": []
    },
    {
      "key": "kvNamespacesList",
      "displayName": "List Cloudflare KV Namespaces",
      "description": "List KV namespaces.",
      "method": "GET",
      "path": "/accounts/{accountId}/storage/kv/namespaces",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": []
    }
  ]
};
