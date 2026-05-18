import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.freshbooks",
  "packageName": "@kesarcloud/plugin-freshbooks",
  "version": "0.1.0",
  "displayName": "FreshBooks",
  "routePath": "freshbooks",
  "description": "Connects PaperClaw agents to FreshBooks for clients, invoices, expenses, payments, estimates, projects, and reports.",
  "apiBaseUrl": "https://api.freshbooks.com",
  "authUrl": "https://my.freshbooks.com/service/auth/oauth/authorize",
  "tokenUrl": "https://api.freshbooks.com/auth/oauth/token",
  "tokenLabel": "FreshBooks Access Token",
  "oauthLabel": "FreshBooks OAuth",
  "connectedLabel": "Account ID",
  "defaultScopes": [
    "user:profile:read",
    "user:clients:read",
    "user:clients:write",
    "user:invoices:read",
    "user:invoices:write",
    "user:expenses:read",
    "user:payments:read"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "identityGet",
      "displayName": "Get FreshBooks Identity",
      "description": "Get authenticated identity.",
      "method": "GET",
      "path": "/auth/api/v1/users/me",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "clientsList",
      "displayName": "List FreshBooks Clients",
      "description": "List clients.",
      "method": "GET",
      "path": "/accounting/account/{accountId}/users/clients",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": [
        "page",
        "per_page",
        "search"
      ]
    },
    {
      "key": "clientCreate",
      "displayName": "Create FreshBooks Client",
      "description": "Create a client.",
      "method": "POST",
      "path": "/accounting/account/{accountId}/users/clients",
      "mutating": true,
      "required": [
        "accountId"
      ],
      "queryParams": [],
      "bodyParam": "client"
    },
    {
      "key": "invoicesList",
      "displayName": "List FreshBooks Invoices",
      "description": "List invoices.",
      "method": "GET",
      "path": "/accounting/account/{accountId}/invoices/invoices",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": [
        "page",
        "per_page",
        "search"
      ]
    },
    {
      "key": "invoiceCreate",
      "displayName": "Create FreshBooks Invoice",
      "description": "Create an invoice.",
      "method": "POST",
      "path": "/accounting/account/{accountId}/invoices/invoices",
      "mutating": true,
      "required": [
        "accountId"
      ],
      "queryParams": [],
      "bodyParam": "invoice"
    },
    {
      "key": "expensesList",
      "displayName": "List FreshBooks Expenses",
      "description": "List expenses.",
      "method": "GET",
      "path": "/accounting/account/{accountId}/expenses/expenses",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": [
        "page",
        "per_page"
      ]
    },
    {
      "key": "paymentsList",
      "displayName": "List FreshBooks Payments",
      "description": "List payments.",
      "method": "GET",
      "path": "/accounting/account/{accountId}/payments/payments",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": [
        "page",
        "per_page"
      ]
    },
    {
      "key": "estimatesList",
      "displayName": "List FreshBooks Estimates",
      "description": "List estimates.",
      "method": "GET",
      "path": "/accounting/account/{accountId}/estimates/estimates",
      "mutating": false,
      "required": [
        "accountId"
      ],
      "queryParams": [
        "page",
        "per_page"
      ]
    },
    {
      "key": "projectsList",
      "displayName": "List FreshBooks Projects",
      "description": "List projects.",
      "method": "GET",
      "path": "/projects/business/{businessId}/projects",
      "mutating": false,
      "required": [
        "businessId"
      ],
      "queryParams": [
        "page",
        "per_page"
      ]
    }
  ]
};
