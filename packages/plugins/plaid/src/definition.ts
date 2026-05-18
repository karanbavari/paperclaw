import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.plaid",
  "packageName": "@kesarcloud/plugin-plaid",
  "version": "0.1.0",
  "displayName": "Plaid",
  "routePath": "plaid",
  "description": "Connects PaperClaw agents to Plaid for accounts, balances, transactions, identity, institutions, Link tokens, and item status.",
  "apiBaseUrl": "https://production.plaid.com",
  "tokenLabel": "Plaid Secret",
  "oauthLabel": "Plaid OAuth",
  "connectedLabel": "Plaid Access Token or Item ID",
  "authScheme": "body",
  "accessTokenBodyName": "secret",
  "connectedAccountBodyName": "access_token",
  "defaultScopes": [
    "accounts",
    "transactions",
    "identity"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "accountsGet",
      "displayName": "Get Plaid Accounts",
      "description": "Get accounts for an item.",
      "method": "POST",
      "path": "/accounts/get",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "balancesGet",
      "displayName": "Get Plaid Balances",
      "description": "Get realtime balances.",
      "method": "POST",
      "path": "/accounts/balance/get",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "transactionsSync",
      "displayName": "Sync Plaid Transactions",
      "description": "Sync transactions cursor.",
      "method": "POST",
      "path": "/transactions/sync",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "transactionsGet",
      "displayName": "Get Plaid Transactions",
      "description": "Get transactions by date range.",
      "method": "POST",
      "path": "/transactions/get",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "identityGet",
      "displayName": "Get Plaid Identity",
      "description": "Get identity data.",
      "method": "POST",
      "path": "/identity/get",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "institutionsSearch",
      "displayName": "Search Plaid Institutions",
      "description": "Search institutions.",
      "method": "POST",
      "path": "/institutions/search",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "linkTokenCreate",
      "displayName": "Create Plaid Link Token",
      "description": "Create a Link token.",
      "method": "POST",
      "path": "/link/token/create",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "itemGet",
      "displayName": "Get Plaid Item",
      "description": "Get item status.",
      "method": "POST",
      "path": "/item/get",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "itemRemove",
      "displayName": "Remove Plaid Item",
      "description": "Remove an item.",
      "method": "POST",
      "path": "/item/remove",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    }
  ]
};
