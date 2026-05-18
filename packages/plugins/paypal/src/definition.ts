import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";

export const definition: FinanceDefinition = {
  "id": "paperclaw.paypal",
  "packageName": "@kesarcloud/plugin-paypal",
  "version": "0.1.0",
  "displayName": "PayPal",
  "routePath": "paypal",
  "description": "Connects PaperClaw agents to PayPal REST APIs for invoices, orders, payments, captures, refunds, payouts, and webhooks.",
  "apiBaseUrl": "https://api-m.paypal.com",
  "tokenUrl": "https://api-m.paypal.com/v1/oauth2/token",
  "tokenLabel": "PayPal Access Token",
  "oauthLabel": "PayPal OAuth",
  "connectedLabel": "PayPal Merchant",
  "defaultScopes": [
    "openid"
  ],
  "rawPathPrefixes": [
    "/"
  ],
  "endpoints": [
    {
      "key": "invoicesList",
      "displayName": "List PayPal Invoices",
      "description": "List invoices.",
      "method": "GET",
      "path": "/v2/invoicing/invoices",
      "mutating": false,
      "required": [],
      "queryParams": [
        "page",
        "page_size",
        "total_required"
      ]
    },
    {
      "key": "invoiceGet",
      "displayName": "Get PayPal Invoice",
      "description": "Get an invoice.",
      "method": "GET",
      "path": "/v2/invoicing/invoices/{invoiceId}",
      "mutating": false,
      "required": [
        "invoiceId"
      ],
      "queryParams": []
    },
    {
      "key": "invoiceCreate",
      "displayName": "Create PayPal Invoice",
      "description": "Create an invoice.",
      "method": "POST",
      "path": "/v2/invoicing/invoices",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "invoice"
    },
    {
      "key": "invoiceSend",
      "displayName": "Send PayPal Invoice",
      "description": "Send an invoice.",
      "method": "POST",
      "path": "/v2/invoicing/invoices/{invoiceId}/send",
      "mutating": true,
      "required": [
        "invoiceId"
      ],
      "queryParams": [],
      "bodyParam": "send"
    },
    {
      "key": "ordersCreate",
      "displayName": "Create PayPal Order",
      "description": "Create an order.",
      "method": "POST",
      "path": "/v2/checkout/orders",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "order"
    },
    {
      "key": "orderGet",
      "displayName": "Get PayPal Order",
      "description": "Get an order.",
      "method": "GET",
      "path": "/v2/checkout/orders/{orderId}",
      "mutating": false,
      "required": [
        "orderId"
      ],
      "queryParams": []
    },
    {
      "key": "captureRefund",
      "displayName": "Refund PayPal Capture",
      "description": "Refund a captured payment.",
      "method": "POST",
      "path": "/v2/payments/captures/{captureId}/refund",
      "mutating": true,
      "required": [
        "captureId"
      ],
      "queryParams": [],
      "bodyParam": "refund"
    },
    {
      "key": "payoutCreate",
      "displayName": "Create PayPal Payout",
      "description": "Create a payout batch.",
      "method": "POST",
      "path": "/v1/payments/payouts",
      "mutating": true,
      "required": [],
      "queryParams": [],
      "bodyParam": "payout"
    },
    {
      "key": "webhooksList",
      "displayName": "List PayPal Webhooks",
      "description": "List webhooks.",
      "method": "GET",
      "path": "/v1/notifications/webhooks",
      "mutating": false,
      "required": [],
      "queryParams": []
    }
  ]
};
