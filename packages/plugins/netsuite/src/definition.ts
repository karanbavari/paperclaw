import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.netsuite",
  "packageName": "@kesarcloud/plugin-netsuite",
  "version": "0.1.0",
  "displayName": "NetSuite",
  "routePath": "netsuite",
  "description": "Connects PaperClaw agents to NetSuite REST Web Services for records, SuiteQL, invoices, bills, customers, vendors, payments, and journals.",
  "apiBaseUrl": "https://account-id.suitetalk.api.netsuite.com/services/rest",
  "tokenLabel": "NetSuite Access Token",
  "oauthLabel": "NetSuite OAuth",
  "connectedLabel": "NetSuite Account ID",
  "apiBaseUrlLabel": "NetSuite Account REST Base URL",
  "defaultScopes": [
    "rest_webservices"
  ],
  "rawPathPrefixes": [
    "/record/v1",
    "/query/v1",
    "/metadata-catalog"
  ],
  "endpoints": [
    {
      "key": "suiteqlQuery",
      "displayName": "Run NetSuite SuiteQL",
      "description": "Run a SuiteQL query.",
      "method": "POST",
      "path": "/query/v1/suiteql",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "query"
    },
    {
      "key": "customersList",
      "displayName": "List NetSuite Customers",
      "description": "List customer records.",
      "method": "GET",
      "path": "/record/v1/customer",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "q"
      ]
    },
    {
      "key": "customerGet",
      "displayName": "Get NetSuite Customer",
      "description": "Get a customer record.",
      "method": "GET",
      "path": "/record/v1/customer/{customerId}",
      "mutating": false,
      "required": [
        "customerId"
      ],
      "queryParams": []
    },
    {
      "key": "vendorsList",
      "displayName": "List NetSuite Vendors",
      "description": "List vendor records.",
      "method": "GET",
      "path": "/record/v1/vendor",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "q"
      ]
    },
    {
      "key": "invoicesList",
      "displayName": "List NetSuite Invoices",
      "description": "List invoice records.",
      "method": "GET",
      "path": "/record/v1/invoice",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "q"
      ]
    },
    {
      "key": "invoiceCreate",
      "displayName": "Create NetSuite Invoice",
      "description": "Create an invoice record.",
      "method": "POST",
      "path": "/record/v1/invoice",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "invoice"
    },
    {
      "key": "billsList",
      "displayName": "List NetSuite Vendor Bills",
      "description": "List vendor bill records.",
      "method": "GET",
      "path": "/record/v1/vendorBill",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset",
        "q"
      ]
    },
    {
      "key": "billCreate",
      "displayName": "Create NetSuite Vendor Bill",
      "description": "Create a vendor bill record.",
      "method": "POST",
      "path": "/record/v1/vendorBill",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "bill"
    },
    {
      "key": "journalCreate",
      "displayName": "Create NetSuite Journal Entry",
      "description": "Create a journal entry.",
      "method": "POST",
      "path": "/record/v1/journalEntry",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "journalEntry"
    }
  ]
};
