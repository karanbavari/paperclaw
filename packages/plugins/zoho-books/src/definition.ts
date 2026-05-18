import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.zoho-books",
  "packageName": "@kesarcloud/plugin-zoho-books",
  "version": "0.1.0",
  "displayName": "Zoho Books",
  "routePath": "zoho-books",
  "description": "Connects PaperClaw agents to Zoho Books for organizations, contacts, invoices, bills, expenses, payments, items, and reports.",
  "apiBaseUrl": "https://www.zohoapis.com/books/v3",
  "authUrl": "https://accounts.zoho.com/oauth/v2/auth",
  "tokenUrl": "https://accounts.zoho.com/oauth/v2/token",
  "tokenLabel": "Zoho Books Access Token",
  "oauthLabel": "Zoho OAuth",
  "connectedLabel": "Organization ID",
  "defaultScopes": [
    "ZohoBooks.fullaccess.all"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "organizationsList",
      "displayName": "List Zoho Books Organizations",
      "description": "List organizations.",
      "method": "GET",
      "path": "/organizations",
      "mutating": false,
      "required": [],
      "queryParams": []
    },
    {
      "key": "contactsList",
      "displayName": "List Zoho Books Contacts",
      "description": "List contacts.",
      "method": "GET",
      "path": "/contacts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "organization_id",
        "page",
        "per_page",
        "search_text"
      ]
    },
    {
      "key": "contactCreate",
      "displayName": "Create Zoho Books Contact",
      "description": "Create a contact.",
      "method": "POST",
      "path": "/contacts",
      "mutating": true,
      "required": [],
      "queryParams": [
        "organization_id"
      ],
      "bodyParam": "contact"
    },
    {
      "key": "invoicesList",
      "displayName": "List Zoho Books Invoices",
      "description": "List invoices.",
      "method": "GET",
      "path": "/invoices",
      "mutating": false,
      "required": [],
      "queryParams": [
        "organization_id",
        "page",
        "per_page",
        "status"
      ]
    },
    {
      "key": "invoiceCreate",
      "displayName": "Create Zoho Books Invoice",
      "description": "Create an invoice.",
      "method": "POST",
      "path": "/invoices",
      "mutating": true,
      "required": [],
      "queryParams": [
        "organization_id"
      ],
      "bodyParam": "invoice"
    },
    {
      "key": "billsList",
      "displayName": "List Zoho Books Bills",
      "description": "List bills.",
      "method": "GET",
      "path": "/bills",
      "mutating": false,
      "required": [],
      "queryParams": [
        "organization_id",
        "page",
        "per_page",
        "status"
      ]
    },
    {
      "key": "billCreate",
      "displayName": "Create Zoho Books Bill",
      "description": "Create a bill.",
      "method": "POST",
      "path": "/bills",
      "mutating": true,
      "required": [],
      "queryParams": [
        "organization_id"
      ],
      "bodyParam": "bill"
    },
    {
      "key": "expensesList",
      "displayName": "List Zoho Books Expenses",
      "description": "List expenses.",
      "method": "GET",
      "path": "/expenses",
      "mutating": false,
      "required": [],
      "queryParams": [
        "organization_id",
        "page",
        "per_page"
      ]
    },
    {
      "key": "paymentsList",
      "displayName": "List Zoho Books Payments",
      "description": "List customer payments.",
      "method": "GET",
      "path": "/customerpayments",
      "mutating": false,
      "required": [],
      "queryParams": [
        "organization_id",
        "page",
        "per_page"
      ]
    },
    {
      "key": "itemsList",
      "displayName": "List Zoho Books Items",
      "description": "List items.",
      "method": "GET",
      "path": "/items",
      "mutating": false,
      "required": [],
      "queryParams": [
        "organization_id",
        "page",
        "per_page"
      ]
    }
  ]
};
