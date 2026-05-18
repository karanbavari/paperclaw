import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.brex",
  "packageName": "@kesarcloud/plugin-brex",
  "version": "0.1.0",
  "displayName": "Brex",
  "routePath": "brex",
  "description": "Connects PaperClaw agents to Brex for transactions, expenses, cards, vendors, payments, users, and budgets.",
  "apiBaseUrl": "https://platform.brexapis.com",
  "authUrl": "https://accounts-api.brex.com/oauth2/default/v1/authorize",
  "tokenUrl": "https://accounts-api.brex.com/oauth2/default/v1/token",
  "tokenLabel": "Brex Access Token",
  "oauthLabel": "Brex OAuth",
  "connectedLabel": "Brex Account",
  "defaultScopes": [
    "openid",
    "offline_access"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "usersList",
      "displayName": "List Brex Users",
      "description": "List users.",
      "method": "GET",
      "path": "/v2/users",
      "mutating": false,
      "required": [],
      "queryParams": [
        "cursor",
        "limit"
      ]
    },
    {
      "key": "transactionsList",
      "displayName": "List Brex Transactions",
      "description": "List card transactions.",
      "method": "GET",
      "path": "/v2/transactions/card/primary",
      "mutating": false,
      "required": [],
      "queryParams": [
        "cursor",
        "limit"
      ]
    },
    {
      "key": "expensesList",
      "displayName": "List Brex Expenses",
      "description": "List expenses.",
      "method": "GET",
      "path": "/v1/expenses/card",
      "mutating": false,
      "required": [],
      "queryParams": [
        "cursor",
        "limit"
      ]
    },
    {
      "key": "cardsList",
      "displayName": "List Brex Cards",
      "description": "List cards.",
      "method": "GET",
      "path": "/v2/cards",
      "mutating": false,
      "required": [],
      "queryParams": [
        "cursor",
        "limit"
      ]
    },
    {
      "key": "cardGet",
      "displayName": "Get Brex Card",
      "description": "Get card details.",
      "method": "GET",
      "path": "/v2/cards/{cardId}",
      "mutating": false,
      "required": [
        "cardId"
      ],
      "queryParams": []
    },
    {
      "key": "vendorsList",
      "displayName": "List Brex Vendors",
      "description": "List vendors.",
      "method": "GET",
      "path": "/v1/vendors",
      "mutating": false,
      "required": [],
      "queryParams": [
        "cursor",
        "limit"
      ]
    },
    {
      "key": "paymentsList",
      "displayName": "List Brex Payments",
      "description": "List payments.",
      "method": "GET",
      "path": "/v1/payments",
      "mutating": false,
      "required": [],
      "queryParams": [
        "cursor",
        "limit"
      ]
    },
    {
      "key": "paymentCreate",
      "displayName": "Create Brex Payment",
      "description": "Create a payment.",
      "method": "POST",
      "path": "/v1/payments",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "payment"
    },
    {
      "key": "budgetsList",
      "displayName": "List Brex Budgets",
      "description": "List budgets.",
      "method": "GET",
      "path": "/v1/budgets",
      "mutating": false,
      "required": [],
      "queryParams": [
        "cursor",
        "limit"
      ]
    }
  ]
};
