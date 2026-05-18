import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.wise",
  "packageName": "@kesarcloud/plugin-wise",
  "version": "0.1.0",
  "displayName": "Wise",
  "routePath": "wise",
  "description": "Connects PaperClaw agents to Wise Platform for profiles, balances, rates, quotes, recipients, transfers, and statements.",
  "apiBaseUrl": "https://api.transferwise.com",
  "tokenLabel": "Wise API Token",
  "oauthLabel": "Wise OAuth",
  "connectedLabel": "Profile ID",
  "defaultScopes": [
    "profile",
    "transfers"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "profilesList",
      "displayName": "List Wise Profiles",
      "description": "List profiles.",
      "method": "GET",
      "path": "/v2/profiles",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "balancesList",
      "displayName": "List Wise Balances",
      "description": "List balances.",
      "method": "GET",
      "path": "/v4/profiles/{profileId}/balances",
      "mutating": false,
      "required": [
        "profileId"
      ],
      "queryParams": [
        "types"
      ]
    },
    {
      "key": "ratesGet",
      "displayName": "Get Wise Rates",
      "description": "Get exchange rates.",
      "method": "GET",
      "path": "/v1/rates",
      "mutating": false,
      "required": [],
      "queryParams": [
        "source",
        "target",
        "time"
      ]
    },
    {
      "key": "quoteCreate",
      "displayName": "Create Wise Quote",
      "description": "Create a quote.",
      "method": "POST",
      "path": "/v3/profiles/{profileId}/quotes",
      "mutating": true,
      "required": [
        "profileId"
      ],
      "queryParams": [],
      "bodyParam": "quote"
    },
    {
      "key": "recipientsList",
      "displayName": "List Wise Recipients",
      "description": "List recipient accounts.",
      "method": "GET",
      "path": "/v1/accounts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "profile",
        "currency"
      ]
    },
    {
      "key": "recipientCreate",
      "displayName": "Create Wise Recipient",
      "description": "Create recipient account.",
      "method": "POST",
      "path": "/v1/accounts",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "recipient"
    },
    {
      "key": "transferCreate",
      "displayName": "Create Wise Transfer",
      "description": "Create a transfer.",
      "method": "POST",
      "path": "/v1/transfers",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "transfer"
    },
    {
      "key": "transferGet",
      "displayName": "Get Wise Transfer",
      "description": "Get transfer status.",
      "method": "GET",
      "path": "/v1/transfers/{transferId}",
      "mutating": false,
      "required": [
        "transferId"
      ],
      "queryParams": []
    },
    {
      "key": "statementGet",
      "displayName": "Get Wise Statement",
      "description": "Get balance statement.",
      "method": "GET",
      "path": "/v1/profiles/{profileId}/balance-statements/{balanceId}/statement.json",
      "mutating": false,
      "required": [
        "profileId",
        "balanceId"
      ],
      "queryParams": [
        "intervalStart",
        "intervalEnd",
        "type"
      ]
    }
  ]
};
