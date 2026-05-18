import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.quickbooks-online",
  "packageName": "@kesarcloud/plugin-quickbooks-online",
  "version": "0.1.0",
  "displayName": "QuickBooks Online",
  "routePath": "quickbooks-online",
  "description": "Connects PaperClaw agents to QuickBooks Online for customers, vendors, accounts, invoices, bills, payments, reports, and company data.",
  "apiBaseUrl": "https://quickbooks.api.intuit.com/v3/company",
  "authUrl": "https://appcenter.intuit.com/connect/oauth2",
  "tokenUrl": "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
  "tokenAuthStyle": "basic",
  "tokenLabel": "QuickBooks Access Token",
  "oauthLabel": "QuickBooks OAuth",
  "connectedLabel": "Realm ID",
  "defaultScopes": [
    "com.intuit.quickbooks.accounting",
    "offline_access"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "companyInfoGet",
      "displayName": "Get QuickBooks Company Info",
      "description": "Get company profile information.",
      "method": "GET",
      "path": "/{realmId}/companyinfo/{realmId}",
      "mutating": false,
      "required": [
        "realmId"
      ],
      "queryParams": []
    },
    {
      "key": "query",
      "displayName": "Run QuickBooks Query",
      "description": "Run a QuickBooks read query.",
      "method": "GET",
      "path": "/{realmId}/query",
      "mutating": false,
      "required": [
        "realmId"
      ],
      "queryParams": [
        "query"
      ]
    },
    {
      "key": "customersList",
      "displayName": "List QuickBooks Customers",
      "description": "List customers through the query endpoint.",
      "method": "GET",
      "path": "/{realmId}/query",
      "mutating": false,
      "required": [
        "realmId"
      ],
      "queryParams": [
        "query"
      ]
    },
    {
      "key": "customerCreate",
      "displayName": "Create QuickBooks Customer",
      "description": "Create a customer.",
      "method": "POST",
      "path": "/{realmId}/customer",
      "mutating": true,
      "required": [
        "realmId"
      ],
      "queryParams": [],
      "bodyParam": "customer"
    },
    {
      "key": "invoicesList",
      "displayName": "List QuickBooks Invoices",
      "description": "List invoices through the query endpoint.",
      "method": "GET",
      "path": "/{realmId}/query",
      "mutating": false,
      "required": [
        "realmId"
      ],
      "queryParams": [
        "query"
      ]
    },
    {
      "key": "invoiceGet",
      "displayName": "Get QuickBooks Invoice",
      "description": "Get an invoice.",
      "method": "GET",
      "path": "/{realmId}/invoice/{invoiceId}",
      "mutating": false,
      "required": [
        "realmId",
        "invoiceId"
      ],
      "queryParams": []
    },
    {
      "key": "invoiceCreate",
      "displayName": "Create QuickBooks Invoice",
      "description": "Create an invoice.",
      "method": "POST",
      "path": "/{realmId}/invoice",
      "mutating": true,
      "required": [
        "realmId"
      ],
      "queryParams": [],
      "bodyParam": "invoice"
    },
    {
      "key": "billsList",
      "displayName": "List QuickBooks Bills",
      "description": "List bills through the query endpoint.",
      "method": "GET",
      "path": "/{realmId}/query",
      "mutating": false,
      "required": [
        "realmId"
      ],
      "queryParams": [
        "query"
      ]
    },
    {
      "key": "billCreate",
      "displayName": "Create QuickBooks Bill",
      "description": "Create a bill.",
      "method": "POST",
      "path": "/{realmId}/bill",
      "mutating": true,
      "required": [
        "realmId"
      ],
      "queryParams": [],
      "bodyParam": "bill"
    },
    {
      "key": "paymentCreate",
      "displayName": "Create QuickBooks Payment",
      "description": "Create a customer payment.",
      "method": "POST",
      "path": "/{realmId}/payment",
      "mutating": true,
      "required": [
        "realmId"
      ],
      "queryParams": [],
      "bodyParam": "payment"
    },
    {
      "key": "reportsProfitAndLoss",
      "displayName": "QuickBooks Profit And Loss",
      "description": "Get a Profit and Loss report.",
      "method": "GET",
      "path": "/{realmId}/reports/ProfitAndLoss",
      "mutating": false,
      "required": [
        "realmId"
      ],
      "queryParams": [
        "start_date",
        "end_date",
        "accounting_method"
      ]
    }
  ]
};
