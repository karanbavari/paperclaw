import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.xero",
  "packageName": "@kesarcloud/plugin-xero",
  "version": "0.1.0",
  "displayName": "Xero",
  "routePath": "xero",
  "description": "Connects PaperClaw agents to Xero Accounting for tenants, contacts, invoices, bills, payments, accounts, items, and reports.",
  "apiBaseUrl": "https://api.xero.com",
  "authUrl": "https://login.xero.com/identity/connect/authorize",
  "tokenUrl": "https://identity.xero.com/connect/token",
  "tokenAuthStyle": "basic",
  "tokenLabel": "Xero Access Token",
  "oauthLabel": "Xero OAuth",
  "connectedLabel": "Xero Tenant ID",
  "connectedAccountHeaderName": "xero-tenant-id",
  "defaultScopes": [
    "offline_access",
    "accounting.transactions",
    "accounting.contacts",
    "accounting.settings",
    "accounting.reports.read"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "connectionsList",
      "displayName": "List Xero Connections",
      "description": "List authorized tenants.",
      "method": "GET",
      "path": "/connections",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "contactsList",
      "displayName": "List Xero Contacts",
      "description": "List contacts.",
      "method": "GET",
      "path": "/api.xro/2.0/Contacts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "where",
        "order",
        "page"
      ]
    },
    {
      "key": "contactCreate",
      "displayName": "Create Xero Contact",
      "description": "Create contacts.",
      "method": "POST",
      "path": "/api.xro/2.0/Contacts",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "contacts"
    },
    {
      "key": "invoicesList",
      "displayName": "List Xero Invoices",
      "description": "List invoices.",
      "method": "GET",
      "path": "/api.xro/2.0/Invoices",
      "mutating": false,
      "required": [],
      "queryParams": [
        "where",
        "order",
        "page",
        "Statuses"
      ]
    },
    {
      "key": "invoiceGet",
      "displayName": "Get Xero Invoice",
      "description": "Get an invoice.",
      "method": "GET",
      "path": "/api.xro/2.0/Invoices/{invoiceId}",
      "mutating": false,
      "required": [
        "invoiceId"
      ],
      "queryParams": []
    },
    {
      "key": "invoiceCreate",
      "displayName": "Create Xero Invoice",
      "description": "Create invoices.",
      "method": "POST",
      "path": "/api.xro/2.0/Invoices",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "invoices"
    },
    {
      "key": "paymentsList",
      "displayName": "List Xero Payments",
      "description": "List payments.",
      "method": "GET",
      "path": "/api.xro/2.0/Payments",
      "mutating": false,
      "required": [],
      "queryParams": [
        "where",
        "order",
        "page"
      ]
    },
    {
      "key": "paymentCreate",
      "displayName": "Create Xero Payment",
      "description": "Create a payment.",
      "method": "POST",
      "path": "/api.xro/2.0/Payments",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "payments"
    },
    {
      "key": "accountsList",
      "displayName": "List Xero Accounts",
      "description": "List chart of accounts.",
      "method": "GET",
      "path": "/api.xro/2.0/Accounts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "where",
        "order"
      ]
    },
    {
      "key": "itemsList",
      "displayName": "List Xero Items",
      "description": "List items.",
      "method": "GET",
      "path": "/api.xro/2.0/Items",
      "mutating": false,
      "required": [],
      "queryParams": [
        "where",
        "order"
      ]
    },
    {
      "key": "reportProfitAndLoss",
      "displayName": "Xero Profit And Loss",
      "description": "Get Profit and Loss report.",
      "method": "GET",
      "path": "/api.xro/2.0/Reports/ProfitAndLoss",
      "mutating": false,
      "required": [],
      "queryParams": [
        "fromDate",
        "toDate",
        "periods",
        "timeframe"
      ]
    }
  ]
};
