import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.expensify",
  "packageName": "@kesarcloud/plugin-expensify",
  "version": "0.1.0",
  "displayName": "Expensify",
  "routePath": "expensify",
  "description": "Connects PaperClaw agents to Expensify Integration Server for expense reports, users, policies, exports, and reimbursement workflows.",
  "apiBaseUrl": "https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations",
  "tokenLabel": "Expensify Partner User Secret",
  "oauthLabel": "Expensify OAuth",
  "connectedLabel": "Partner User ID",
  "authScheme": "body",
  "accessTokenBodyName": "partnerUserSecret",
  "connectedAccountBodyName": "partnerUserID",
  "defaultScopes": [
    "integration"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "reportExport",
      "displayName": "Export Expensify Reports",
      "description": "Export expense reports.",
      "method": "POST",
      "path": "/",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "requestJobDescription"
    },
    {
      "key": "reportCreate",
      "displayName": "Create Expensify Report",
      "description": "Create a report job.",
      "method": "POST",
      "path": "/",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "requestJobDescription"
    },
    {
      "key": "policyList",
      "displayName": "List Expensify Policies",
      "description": "List policies.",
      "method": "POST",
      "path": "/",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "requestJobDescription"
    },
    {
      "key": "employeesUpdate",
      "displayName": "Update Expensify Employees",
      "description": "Update employees.",
      "method": "POST",
      "path": "/",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "requestJobDescription"
    },
    {
      "key": "expenseRulesUpdate",
      "displayName": "Update Expensify Expense Rules",
      "description": "Update expense rules.",
      "method": "POST",
      "path": "/",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "requestJobDescription"
    },
    {
      "key": "reimbursementStatus",
      "displayName": "Get Expensify Reimbursement Status",
      "description": "Get reimbursement status.",
      "method": "POST",
      "path": "/",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "requestJobDescription"
    }
  ]
};
