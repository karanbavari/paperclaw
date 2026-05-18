import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.adyen",
  "packageName": "@kesarcloud/plugin-adyen",
  "version": "0.1.0",
  "displayName": "Adyen",
  "routePath": "adyen",
  "description": "Connects PaperClaw agents to Adyen for payments, captures, refunds, payouts, transfers, balance platform, and reporting data.",
  "apiBaseUrl": "https://checkout-live.adyen.com",
  "tokenLabel": "Adyen API Key",
  "oauthLabel": "Adyen OAuth",
  "connectedLabel": "Merchant Account",
  "authScheme": "api-key",
  "accessTokenHeaderName": "x-api-key",
  "defaultScopes": [
    "Checkout API",
    "Payments API"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "paymentMethods",
      "displayName": "List Adyen Payment Methods",
      "description": "List payment methods.",
      "method": "POST",
      "path": "/v71/paymentMethods",
      "mutating": false,
      "required": [],
      "queryParams": [],
      "bodyParam": "body"
    },
    {
      "key": "paymentCreate",
      "displayName": "Create Adyen Payment",
      "description": "Create a payment.",
      "method": "POST",
      "path": "/v71/payments",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "payment"
    },
    {
      "key": "paymentDetails",
      "displayName": "Submit Adyen Payment Details",
      "description": "Submit additional payment details.",
      "method": "POST",
      "path": "/v71/payments/details",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "details"
    },
    {
      "key": "capturePayment",
      "displayName": "Capture Adyen Payment",
      "description": "Capture a payment.",
      "method": "POST",
      "path": "/v71/payments/{pspReference}/captures",
      "mutating": true,
      "required": [
        "pspReference"
      ],
      "queryParams": [],
      "bodyParam": "capture"
    },
    {
      "key": "refundPayment",
      "displayName": "Refund Adyen Payment",
      "description": "Refund a payment.",
      "method": "POST",
      "path": "/v71/payments/{pspReference}/refunds",
      "mutating": true,
      "required": [
        "pspReference"
      ],
      "queryParams": [],
      "bodyParam": "refund"
    },
    {
      "key": "payoutCreate",
      "displayName": "Create Adyen Payout",
      "description": "Create a payout.",
      "method": "POST",
      "path": "/v68/payout",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "payout"
    },
    {
      "key": "transferCreate",
      "displayName": "Create Adyen Transfer",
      "description": "Create a balance platform transfer.",
      "method": "POST",
      "path": "/bcl/v2/transfers",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "transfer"
    },
    {
      "key": "balanceAccountsList",
      "displayName": "List Adyen Balance Accounts",
      "description": "List balance accounts.",
      "method": "GET",
      "path": "/bcl/v2/balanceAccounts",
      "mutating": false,
      "required": [],
      "queryParams": [
        "limit",
        "offset"
      ]
    },
    {
      "key": "reportsList",
      "displayName": "List Adyen Reports",
      "description": "List reports.",
      "method": "GET",
      "path": "/report/v1/reports",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "pageSize"
      ]
    }
  ]
};
