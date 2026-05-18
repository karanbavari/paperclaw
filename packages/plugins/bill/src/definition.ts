import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.bill",
  "packageName": "@kesarcloud/plugin-bill",
  "version": "0.1.0",
  "displayName": "BILL",
  "routePath": "bill",
  "description": "Connects PaperClaw agents to BILL for vendors, bills, payments, invoices, customers, chart of accounts, and payment operations.",
  "apiBaseUrl": "https://gateway.prod.bill.com/connect/v3",
  "authUrl": "https://app.bill.com/oauth/authorize",
  "tokenUrl": "https://gateway.prod.bill.com/connect/v3/login/token",
  "tokenLabel": "BILL Access Token",
  "oauthLabel": "BILL OAuth",
  "connectedLabel": "BILL Organization ID",
  "defaultScopes": [
    "offline_access"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "vendorsList",
      "displayName": "List BILL Vendors",
      "description": "List vendors.",
      "method": "GET",
      "path": "/vendors",
      "mutating": false,
      "required": [],
      "queryParams": [
        "max",
        "start",
        "filters"
      ]
    },
    {
      "key": "vendorCreate",
      "displayName": "Create BILL Vendor",
      "description": "Create a vendor.",
      "method": "POST",
      "path": "/vendors",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "vendor"
    },
    {
      "key": "billsList",
      "displayName": "List BILL Bills",
      "description": "List bills.",
      "method": "GET",
      "path": "/bills",
      "mutating": false,
      "required": [],
      "queryParams": [
        "max",
        "start",
        "filters"
      ]
    },
    {
      "key": "billCreate",
      "displayName": "Create BILL Bill",
      "description": "Create a bill.",
      "method": "POST",
      "path": "/bills",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "bill"
    },
    {
      "key": "paymentsList",
      "displayName": "List BILL Payments",
      "description": "List payments.",
      "method": "GET",
      "path": "/payments",
      "mutating": false,
      "required": [],
      "queryParams": [
        "max",
        "start",
        "filters"
      ]
    },
    {
      "key": "paymentCreate",
      "displayName": "Create BILL Payment",
      "description": "Create or schedule a payment.",
      "method": "POST",
      "path": "/payments",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "payment"
    },
    {
      "key": "invoicesList",
      "displayName": "List BILL Invoices",
      "description": "List receivables invoices.",
      "method": "GET",
      "path": "/invoices",
      "mutating": false,
      "required": [],
      "queryParams": [
        "max",
        "start",
        "filters"
      ]
    },
    {
      "key": "customersList",
      "displayName": "List BILL Customers",
      "description": "List customers.",
      "method": "GET",
      "path": "/customers",
      "mutating": false,
      "required": [],
      "queryParams": [
        "max",
        "start",
        "filters"
      ]
    },
    {
      "key": "accountsList",
      "displayName": "List BILL Accounts",
      "description": "List chart of accounts.",
      "method": "GET",
      "path": "/chart-of-accounts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "max",
        "start"
      ]
    }
  ]
};
