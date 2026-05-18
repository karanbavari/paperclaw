import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();

const commonDevDeps = {
  "@types/node": "^24.6.0",
  "@types/react": "^19.0.8",
  "@types/react-dom": "^19.0.3",
  react: "^19.0.8",
  "react-dom": "^19.0.8",
  typescript: "^5.7.3",
  vitest: "^3.2.4",
};

const plugins = [
  {
    slug: "quickbooks-online",
    displayName: "QuickBooks Online",
    description: "Connects PaperClaw agents to QuickBooks Online for customers, vendors, accounts, invoices, bills, payments, reports, and company data.",
    apiBaseUrl: "https://quickbooks.api.intuit.com/v3/company",
    authUrl: "https://appcenter.intuit.com/connect/oauth2",
    tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    tokenAuthStyle: "basic",
    tokenLabel: "QuickBooks Access Token",
    oauthLabel: "QuickBooks OAuth",
    connectedLabel: "Realm ID",
    defaultScopes: ["com.intuit.quickbooks.accounting", "offline_access"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["companyInfoGet", "Get QuickBooks Company Info", "Get company profile information.", "GET", "/{realmId}/companyinfo/{realmId}", false, ["realmId"]],
      ["query", "Run QuickBooks Query", "Run a QuickBooks read query.", "GET", "/{realmId}/query", false, ["realmId"], ["query"]],
      ["customersList", "List QuickBooks Customers", "List customers through the query endpoint.", "GET", "/{realmId}/query", false, ["realmId"], ["query"]],
      ["customerCreate", "Create QuickBooks Customer", "Create a customer.", "POST", "/{realmId}/customer", true, ["realmId"], [], "customer"],
      ["invoicesList", "List QuickBooks Invoices", "List invoices through the query endpoint.", "GET", "/{realmId}/query", false, ["realmId"], ["query"]],
      ["invoiceGet", "Get QuickBooks Invoice", "Get an invoice.", "GET", "/{realmId}/invoice/{invoiceId}", false, ["realmId", "invoiceId"]],
      ["invoiceCreate", "Create QuickBooks Invoice", "Create an invoice.", "POST", "/{realmId}/invoice", true, ["realmId"], [], "invoice"],
      ["billsList", "List QuickBooks Bills", "List bills through the query endpoint.", "GET", "/{realmId}/query", false, ["realmId"], ["query"]],
      ["billCreate", "Create QuickBooks Bill", "Create a bill.", "POST", "/{realmId}/bill", true, ["realmId"], [], "bill"],
      ["paymentCreate", "Create QuickBooks Payment", "Create a customer payment.", "POST", "/{realmId}/payment", true, ["realmId"], [], "payment"],
      ["reportsProfitAndLoss", "QuickBooks Profit And Loss", "Get a Profit and Loss report.", "GET", "/{realmId}/reports/ProfitAndLoss", false, ["realmId"], ["start_date", "end_date", "accounting_method"]],
    ],
  },
  {
    slug: "xero",
    displayName: "Xero",
    description: "Connects PaperClaw agents to Xero Accounting for tenants, contacts, invoices, bills, payments, accounts, items, and reports.",
    apiBaseUrl: "https://api.xero.com",
    authUrl: "https://login.xero.com/identity/connect/authorize",
    tokenUrl: "https://identity.xero.com/connect/token",
    tokenAuthStyle: "basic",
    tokenLabel: "Xero Access Token",
    oauthLabel: "Xero OAuth",
    connectedLabel: "Xero Tenant ID",
    connectedAccountHeaderName: "xero-tenant-id",
    defaultScopes: ["offline_access", "accounting.transactions", "accounting.contacts", "accounting.settings", "accounting.reports.read"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["connectionsList", "List Xero Connections", "List authorized tenants.", "GET", "/connections", false],
      ["contactsList", "List Xero Contacts", "List contacts.", "GET", "/api.xro/2.0/Contacts", false, [], ["where", "order", "page"]],
      ["contactCreate", "Create Xero Contact", "Create contacts.", "POST", "/api.xro/2.0/Contacts", true, [], [], "contacts"],
      ["invoicesList", "List Xero Invoices", "List invoices.", "GET", "/api.xro/2.0/Invoices", false, [], ["where", "order", "page", "Statuses"]],
      ["invoiceGet", "Get Xero Invoice", "Get an invoice.", "GET", "/api.xro/2.0/Invoices/{invoiceId}", false, ["invoiceId"]],
      ["invoiceCreate", "Create Xero Invoice", "Create invoices.", "POST", "/api.xro/2.0/Invoices", true, [], [], "invoices"],
      ["paymentsList", "List Xero Payments", "List payments.", "GET", "/api.xro/2.0/Payments", false, [], ["where", "order", "page"]],
      ["paymentCreate", "Create Xero Payment", "Create a payment.", "POST", "/api.xro/2.0/Payments", true, [], [], "payments"],
      ["accountsList", "List Xero Accounts", "List chart of accounts.", "GET", "/api.xro/2.0/Accounts", false, [], ["where", "order"]],
      ["itemsList", "List Xero Items", "List items.", "GET", "/api.xro/2.0/Items", false, [], ["where", "order"]],
      ["reportProfitAndLoss", "Xero Profit And Loss", "Get Profit and Loss report.", "GET", "/api.xro/2.0/Reports/ProfitAndLoss", false, [], ["fromDate", "toDate", "periods", "timeframe"]],
    ],
  },
  {
    slug: "zoho-books",
    displayName: "Zoho Books",
    description: "Connects PaperClaw agents to Zoho Books for organizations, contacts, invoices, bills, expenses, payments, items, and reports.",
    apiBaseUrl: "https://www.zohoapis.com/books/v3",
    authUrl: "https://accounts.zoho.com/oauth/v2/auth",
    tokenUrl: "https://accounts.zoho.com/oauth/v2/token",
    tokenLabel: "Zoho Books Access Token",
    oauthLabel: "Zoho OAuth",
    connectedLabel: "Organization ID",
    defaultScopes: ["ZohoBooks.fullaccess.all"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["organizationsList", "List Zoho Books Organizations", "List organizations.", "GET", "/organizations", false],
      ["contactsList", "List Zoho Books Contacts", "List contacts.", "GET", "/contacts", false, [], ["organization_id", "page", "per_page", "search_text"]],
      ["contactCreate", "Create Zoho Books Contact", "Create a contact.", "POST", "/contacts", true, [], ["organization_id"], "contact"],
      ["invoicesList", "List Zoho Books Invoices", "List invoices.", "GET", "/invoices", false, [], ["organization_id", "page", "per_page", "status"]],
      ["invoiceCreate", "Create Zoho Books Invoice", "Create an invoice.", "POST", "/invoices", true, [], ["organization_id"], "invoice"],
      ["billsList", "List Zoho Books Bills", "List bills.", "GET", "/bills", false, [], ["organization_id", "page", "per_page", "status"]],
      ["billCreate", "Create Zoho Books Bill", "Create a bill.", "POST", "/bills", true, [], ["organization_id"], "bill"],
      ["expensesList", "List Zoho Books Expenses", "List expenses.", "GET", "/expenses", false, [], ["organization_id", "page", "per_page"]],
      ["paymentsList", "List Zoho Books Payments", "List customer payments.", "GET", "/customerpayments", false, [], ["organization_id", "page", "per_page"]],
      ["itemsList", "List Zoho Books Items", "List items.", "GET", "/items", false, [], ["organization_id", "page", "per_page"]],
    ],
  },
  {
    slug: "freshbooks",
    displayName: "FreshBooks",
    description: "Connects PaperClaw agents to FreshBooks for clients, invoices, expenses, payments, estimates, projects, and reports.",
    apiBaseUrl: "https://api.freshbooks.com",
    authUrl: "https://my.freshbooks.com/service/auth/oauth/authorize",
    tokenUrl: "https://api.freshbooks.com/auth/oauth/token",
    tokenLabel: "FreshBooks Access Token",
    oauthLabel: "FreshBooks OAuth",
    connectedLabel: "Account ID",
    defaultScopes: ["user:profile:read", "user:clients:read", "user:clients:write", "user:invoices:read", "user:invoices:write", "user:expenses:read", "user:payments:read"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["identityGet", "Get FreshBooks Identity", "Get authenticated identity.", "GET", "/auth/api/v1/users/me", false],
      ["clientsList", "List FreshBooks Clients", "List clients.", "GET", "/accounting/account/{accountId}/users/clients", false, ["accountId"], ["page", "per_page", "search"]],
      ["clientCreate", "Create FreshBooks Client", "Create a client.", "POST", "/accounting/account/{accountId}/users/clients", true, ["accountId"], [], "client"],
      ["invoicesList", "List FreshBooks Invoices", "List invoices.", "GET", "/accounting/account/{accountId}/invoices/invoices", false, ["accountId"], ["page", "per_page", "search"]],
      ["invoiceCreate", "Create FreshBooks Invoice", "Create an invoice.", "POST", "/accounting/account/{accountId}/invoices/invoices", true, ["accountId"], [], "invoice"],
      ["expensesList", "List FreshBooks Expenses", "List expenses.", "GET", "/accounting/account/{accountId}/expenses/expenses", false, ["accountId"], ["page", "per_page"]],
      ["paymentsList", "List FreshBooks Payments", "List payments.", "GET", "/accounting/account/{accountId}/payments/payments", false, ["accountId"], ["page", "per_page"]],
      ["estimatesList", "List FreshBooks Estimates", "List estimates.", "GET", "/accounting/account/{accountId}/estimates/estimates", false, ["accountId"], ["page", "per_page"]],
      ["projectsList", "List FreshBooks Projects", "List projects.", "GET", "/projects/business/{businessId}/projects", false, ["businessId"], ["page", "per_page"]],
    ],
  },
  {
    slug: "bill",
    displayName: "BILL",
    description: "Connects PaperClaw agents to BILL for vendors, bills, payments, invoices, customers, chart of accounts, and payment operations.",
    apiBaseUrl: "https://gateway.prod.bill.com/connect/v3",
    authUrl: "https://app.bill.com/oauth/authorize",
    tokenUrl: "https://gateway.prod.bill.com/connect/v3/login/token",
    tokenLabel: "BILL Access Token",
    oauthLabel: "BILL OAuth",
    connectedLabel: "BILL Organization ID",
    defaultScopes: ["offline_access"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["vendorsList", "List BILL Vendors", "List vendors.", "GET", "/vendors", false, [], ["max", "start", "filters"]],
      ["vendorCreate", "Create BILL Vendor", "Create a vendor.", "POST", "/vendors", true, [], [], "vendor"],
      ["billsList", "List BILL Bills", "List bills.", "GET", "/bills", false, [], ["max", "start", "filters"]],
      ["billCreate", "Create BILL Bill", "Create a bill.", "POST", "/bills", true, [], [], "bill"],
      ["paymentsList", "List BILL Payments", "List payments.", "GET", "/payments", false, [], ["max", "start", "filters"]],
      ["paymentCreate", "Create BILL Payment", "Create or schedule a payment.", "POST", "/payments", true, [], [], "payment"],
      ["invoicesList", "List BILL Invoices", "List receivables invoices.", "GET", "/invoices", false, [], ["max", "start", "filters"]],
      ["customersList", "List BILL Customers", "List customers.", "GET", "/customers", false, [], ["max", "start", "filters"]],
      ["accountsList", "List BILL Accounts", "List chart of accounts.", "GET", "/chart-of-accounts", false, [], ["max", "start"]],
    ],
  },
  {
    slug: "netsuite",
    displayName: "NetSuite",
    description: "Connects PaperClaw agents to NetSuite REST Web Services for records, SuiteQL, invoices, bills, customers, vendors, payments, and journals.",
    apiBaseUrl: "https://account-id.suitetalk.api.netsuite.com/services/rest",
    tokenLabel: "NetSuite Access Token",
    oauthLabel: "NetSuite OAuth",
    connectedLabel: "NetSuite Account ID",
    apiBaseUrlLabel: "NetSuite Account REST Base URL",
    defaultScopes: ["rest_webservices"],
    rawPathPrefixes: ["/record/v1", "/query/v1", "/metadata-catalog"],
    endpoints: [
      ["suiteqlQuery", "Run NetSuite SuiteQL", "Run a SuiteQL query.", "POST", "/query/v1/suiteql", false, [], [], "query"],
      ["customersList", "List NetSuite Customers", "List customer records.", "GET", "/record/v1/customer", false, [], ["limit", "offset", "q"]],
      ["customerGet", "Get NetSuite Customer", "Get a customer record.", "GET", "/record/v1/customer/{customerId}", false, ["customerId"]],
      ["vendorsList", "List NetSuite Vendors", "List vendor records.", "GET", "/record/v1/vendor", false, [], ["limit", "offset", "q"]],
      ["invoicesList", "List NetSuite Invoices", "List invoice records.", "GET", "/record/v1/invoice", false, [], ["limit", "offset", "q"]],
      ["invoiceCreate", "Create NetSuite Invoice", "Create an invoice record.", "POST", "/record/v1/invoice", true, [], [], "invoice"],
      ["billsList", "List NetSuite Vendor Bills", "List vendor bill records.", "GET", "/record/v1/vendorBill", false, [], ["limit", "offset", "q"]],
      ["billCreate", "Create NetSuite Vendor Bill", "Create a vendor bill record.", "POST", "/record/v1/vendorBill", true, [], [], "bill"],
      ["journalCreate", "Create NetSuite Journal Entry", "Create a journal entry.", "POST", "/record/v1/journalEntry", true, [], [], "journalEntry"],
    ],
  },
  {
    slug: "plaid",
    displayName: "Plaid",
    description: "Connects PaperClaw agents to Plaid for accounts, balances, transactions, identity, institutions, Link tokens, and item status.",
    apiBaseUrl: "https://production.plaid.com",
    tokenLabel: "Plaid Secret",
    oauthLabel: "Plaid OAuth",
    connectedLabel: "Plaid Access Token or Item ID",
    authScheme: "body",
    accessTokenBodyName: "secret",
    connectedAccountBodyName: "access_token",
    defaultScopes: ["accounts", "transactions", "identity"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["accountsGet", "Get Plaid Accounts", "Get accounts for an item.", "POST", "/accounts/get", false, [], [], "body"],
      ["balancesGet", "Get Plaid Balances", "Get realtime balances.", "POST", "/accounts/balance/get", false, [], [], "body"],
      ["transactionsSync", "Sync Plaid Transactions", "Sync transactions cursor.", "POST", "/transactions/sync", false, [], [], "body"],
      ["transactionsGet", "Get Plaid Transactions", "Get transactions by date range.", "POST", "/transactions/get", false, [], [], "body"],
      ["identityGet", "Get Plaid Identity", "Get identity data.", "POST", "/identity/get", false, [], [], "body"],
      ["institutionsSearch", "Search Plaid Institutions", "Search institutions.", "POST", "/institutions/search", false, [], [], "body"],
      ["linkTokenCreate", "Create Plaid Link Token", "Create a Link token.", "POST", "/link/token/create", true, [], [], "body"],
      ["itemGet", "Get Plaid Item", "Get item status.", "POST", "/item/get", false, [], [], "body"],
      ["itemRemove", "Remove Plaid Item", "Remove an item.", "POST", "/item/remove", true, [], [], "body"],
    ],
  },
  {
    slug: "wise",
    displayName: "Wise",
    description: "Connects PaperClaw agents to Wise Platform for profiles, balances, rates, quotes, recipients, transfers, and statements.",
    apiBaseUrl: "https://api.transferwise.com",
    tokenLabel: "Wise API Token",
    oauthLabel: "Wise OAuth",
    connectedLabel: "Profile ID",
    defaultScopes: ["profile", "transfers"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["profilesList", "List Wise Profiles", "List profiles.", "GET", "/v2/profiles", false],
      ["balancesList", "List Wise Balances", "List balances.", "GET", "/v4/profiles/{profileId}/balances", false, ["profileId"], ["types"]],
      ["ratesGet", "Get Wise Rates", "Get exchange rates.", "GET", "/v1/rates", false, [], ["source", "target", "time"]],
      ["quoteCreate", "Create Wise Quote", "Create a quote.", "POST", "/v3/profiles/{profileId}/quotes", true, ["profileId"], [], "quote"],
      ["recipientsList", "List Wise Recipients", "List recipient accounts.", "GET", "/v1/accounts", false, [], ["profile", "currency"]],
      ["recipientCreate", "Create Wise Recipient", "Create recipient account.", "POST", "/v1/accounts", true, [], [], "recipient"],
      ["transferCreate", "Create Wise Transfer", "Create a transfer.", "POST", "/v1/transfers", true, [], [], "transfer"],
      ["transferGet", "Get Wise Transfer", "Get transfer status.", "GET", "/v1/transfers/{transferId}", false, ["transferId"]],
      ["statementGet", "Get Wise Statement", "Get balance statement.", "GET", "/v1/profiles/{profileId}/balance-statements/{balanceId}/statement.json", false, ["profileId", "balanceId"], ["intervalStart", "intervalEnd", "type"]],
    ],
  },
  {
    slug: "brex",
    displayName: "Brex",
    description: "Connects PaperClaw agents to Brex for transactions, expenses, cards, vendors, payments, users, and budgets.",
    apiBaseUrl: "https://platform.brexapis.com",
    authUrl: "https://accounts-api.brex.com/oauth2/default/v1/authorize",
    tokenUrl: "https://accounts-api.brex.com/oauth2/default/v1/token",
    tokenLabel: "Brex Access Token",
    oauthLabel: "Brex OAuth",
    connectedLabel: "Brex Account",
    defaultScopes: ["openid", "offline_access"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["usersList", "List Brex Users", "List users.", "GET", "/v2/users", false, [], ["cursor", "limit"]],
      ["transactionsList", "List Brex Transactions", "List card transactions.", "GET", "/v2/transactions/card/primary", false, [], ["cursor", "limit"]],
      ["expensesList", "List Brex Expenses", "List expenses.", "GET", "/v1/expenses/card", false, [], ["cursor", "limit"]],
      ["cardsList", "List Brex Cards", "List cards.", "GET", "/v2/cards", false, [], ["cursor", "limit"]],
      ["cardGet", "Get Brex Card", "Get card details.", "GET", "/v2/cards/{cardId}", false, ["cardId"]],
      ["vendorsList", "List Brex Vendors", "List vendors.", "GET", "/v1/vendors", false, [], ["cursor", "limit"]],
      ["paymentsList", "List Brex Payments", "List payments.", "GET", "/v1/payments", false, [], ["cursor", "limit"]],
      ["paymentCreate", "Create Brex Payment", "Create a payment.", "POST", "/v1/payments", true, [], [], "payment"],
      ["budgetsList", "List Brex Budgets", "List budgets.", "GET", "/v1/budgets", false, [], ["cursor", "limit"]],
    ],
  },
  {
    slug: "paypal",
    displayName: "PayPal",
    description: "Connects PaperClaw agents to PayPal REST APIs for invoices, orders, payments, captures, refunds, payouts, and webhooks.",
    apiBaseUrl: "https://api-m.paypal.com",
    tokenUrl: "https://api-m.paypal.com/v1/oauth2/token",
    tokenLabel: "PayPal Access Token",
    oauthLabel: "PayPal OAuth",
    connectedLabel: "PayPal Merchant",
    defaultScopes: ["openid"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["invoicesList", "List PayPal Invoices", "List invoices.", "GET", "/v2/invoicing/invoices", false, [], ["page", "page_size", "total_required"]],
      ["invoiceGet", "Get PayPal Invoice", "Get an invoice.", "GET", "/v2/invoicing/invoices/{invoiceId}", false, ["invoiceId"]],
      ["invoiceCreate", "Create PayPal Invoice", "Create an invoice.", "POST", "/v2/invoicing/invoices", true, [], [], "invoice"],
      ["invoiceSend", "Send PayPal Invoice", "Send an invoice.", "POST", "/v2/invoicing/invoices/{invoiceId}/send", true, ["invoiceId"], [], "send"],
      ["ordersCreate", "Create PayPal Order", "Create an order.", "POST", "/v2/checkout/orders", true, [], [], "order"],
      ["orderGet", "Get PayPal Order", "Get an order.", "GET", "/v2/checkout/orders/{orderId}", false, ["orderId"]],
      ["captureRefund", "Refund PayPal Capture", "Refund a captured payment.", "POST", "/v2/payments/captures/{captureId}/refund", true, ["captureId"], [], "refund"],
      ["payoutCreate", "Create PayPal Payout", "Create a payout batch.", "POST", "/v1/payments/payouts", true, [], [], "payout"],
      ["webhooksList", "List PayPal Webhooks", "List webhooks.", "GET", "/v1/notifications/webhooks", false],
    ],
  },
  {
    slug: "adyen",
    displayName: "Adyen",
    description: "Connects PaperClaw agents to Adyen for payments, captures, refunds, payouts, transfers, balance platform, and reporting data.",
    apiBaseUrl: "https://checkout-live.adyen.com",
    tokenLabel: "Adyen API Key",
    oauthLabel: "Adyen OAuth",
    connectedLabel: "Merchant Account",
    authScheme: "api-key",
    accessTokenHeaderName: "x-api-key",
    defaultScopes: ["Checkout API", "Payments API"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["paymentMethods", "List Adyen Payment Methods", "List payment methods.", "POST", "/v71/paymentMethods", false, [], [], "body"],
      ["paymentCreate", "Create Adyen Payment", "Create a payment.", "POST", "/v71/payments", true, [], [], "payment"],
      ["paymentDetails", "Submit Adyen Payment Details", "Submit additional payment details.", "POST", "/v71/payments/details", true, [], [], "details"],
      ["capturePayment", "Capture Adyen Payment", "Capture a payment.", "POST", "/v71/payments/{pspReference}/captures", true, ["pspReference"], [], "capture"],
      ["refundPayment", "Refund Adyen Payment", "Refund a payment.", "POST", "/v71/payments/{pspReference}/refunds", true, ["pspReference"], [], "refund"],
      ["payoutCreate", "Create Adyen Payout", "Create a payout.", "POST", "/v68/payout", true, [], [], "payout"],
      ["transferCreate", "Create Adyen Transfer", "Create a balance platform transfer.", "POST", "/bcl/v2/transfers", true, [], [], "transfer"],
      ["balanceAccountsList", "List Adyen Balance Accounts", "List balance accounts.", "GET", "/bcl/v2/balanceAccounts", false, [], ["limit", "offset"]],
      ["reportsList", "List Adyen Reports", "List reports.", "GET", "/report/v1/reports", false, [], ["page", "pageSize"]],
    ],
  },
  {
    slug: "expensify",
    displayName: "Expensify",
    description: "Connects PaperClaw agents to Expensify Integration Server for expense reports, users, policies, exports, and reimbursement workflows.",
    apiBaseUrl: "https://integrations.expensify.com/Integration-Server/ExpensifyIntegrations",
    tokenLabel: "Expensify Partner User Secret",
    oauthLabel: "Expensify OAuth",
    connectedLabel: "Partner User ID",
    authScheme: "body",
    accessTokenBodyName: "partnerUserSecret",
    connectedAccountBodyName: "partnerUserID",
    defaultScopes: ["integration"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["reportExport", "Export Expensify Reports", "Export expense reports.", "POST", "/", false, [], [], "requestJobDescription"],
      ["reportCreate", "Create Expensify Report", "Create a report job.", "POST", "/", true, [], [], "requestJobDescription"],
      ["policyList", "List Expensify Policies", "List policies.", "POST", "/", false, [], [], "requestJobDescription"],
      ["employeesUpdate", "Update Expensify Employees", "Update employees.", "POST", "/", true, [], [], "requestJobDescription"],
      ["expenseRulesUpdate", "Update Expensify Expense Rules", "Update expense rules.", "POST", "/", true, [], [], "requestJobDescription"],
      ["reimbursementStatus", "Get Expensify Reimbursement Status", "Get reimbursement status.", "POST", "/", false, [], [], "requestJobDescription"],
    ],
  },
];

function replaceLegalCore(source) {
  return source
    .replaceAll("legal_law", "finance")
    .replaceAll("Legal", "Finance")
    .replaceAll("legal", "finance")
    .replaceAll("LEGAL", "FINANCE")
    .replaceAll("finance_law", "finance")
    .replaceAll("legal and law", "finance")
    .replaceAll("legal operations data only; they do not provide legal advice", "finance operations data only; they do not provide accounting, tax, investment, or legal advice")
    .replaceAll("legal workspace changes", "finance workspace changes")
    .replaceAll("legal records and documents; they do not provide legal advice", "finance records and transactions; they do not provide accounting, tax, investment, or legal advice");
}

async function copyFinanceCore() {
  const sourceDir = path.join(root, "packages/plugins/legal-core");
  const targetDir = path.join(root, "packages/plugins/finance-core");
  try {
    await fs.access(targetDir);
    return;
  } catch {
    // First-time scaffold fallback only. The committed finance core is maintained directly.
  }
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.join(targetDir, "src"), { recursive: true });
  const packageJson = JSON.parse(await fs.readFile(path.join(sourceDir, "package.json"), "utf8"));
  packageJson.name = "@kesarcloud/plugin-finance-core";
  packageJson.description = "Shared implementation helpers for first-party PaperClaw finance plugins.";
  packageJson.scripts.test = "cd ../../.. && vitest run --project @kesarcloud/plugin-finance-core";
  await fs.writeFile(path.join(targetDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
  await fs.copyFile(path.join(sourceDir, "tsconfig.json"), path.join(targetDir, "tsconfig.json"));
  for (const file of ["shared.ts", "index.ts", "ui.tsx", "index.test.ts"]) {
    await fs.writeFile(path.join(targetDir, "src", file), replaceLegalCore(await fs.readFile(path.join(sourceDir, "src", file), "utf8")));
  }
}

function definitionSource(plugin) {
  const definition = {
    id: `paperclaw.${plugin.slug}`,
    packageName: `@kesarcloud/plugin-${plugin.slug}`,
    version: "0.1.0",
    displayName: plugin.displayName,
    routePath: plugin.slug,
    description: plugin.description,
    apiBaseUrl: plugin.apiBaseUrl,
    ...(plugin.authUrl ? { authUrl: plugin.authUrl } : {}),
    ...(plugin.tokenUrl ? { tokenUrl: plugin.tokenUrl } : {}),
    ...(plugin.tokenAuthStyle ? { tokenAuthStyle: plugin.tokenAuthStyle } : {}),
    tokenLabel: plugin.tokenLabel,
    oauthLabel: plugin.oauthLabel,
    connectedLabel: plugin.connectedLabel,
    ...(plugin.apiBaseUrlLabel ? { apiBaseUrlLabel: plugin.apiBaseUrlLabel } : {}),
    ...(plugin.authScheme ? { authScheme: plugin.authScheme } : {}),
    ...(plugin.accessTokenHeaderName ? { accessTokenHeaderName: plugin.accessTokenHeaderName } : {}),
    ...(plugin.accessTokenBodyName ? { accessTokenBodyName: plugin.accessTokenBodyName } : {}),
    ...(plugin.connectedAccountHeaderName ? { connectedAccountHeaderName: plugin.connectedAccountHeaderName } : {}),
    ...(plugin.connectedAccountBodyName ? { connectedAccountBodyName: plugin.connectedAccountBodyName } : {}),
    defaultScopes: plugin.defaultScopes,
    rawPathPrefixes: plugin.rawPathPrefixes,
    endpoints: plugin.endpoints.map(([key, displayName, description, method, endpointPath, mutating, required = [], queryParams = [], bodyParam]) => ({
      key,
      displayName,
      description,
      method,
      path: endpointPath,
      mutating,
      required,
      queryParams,
      ...(bodyParam ? { bodyParam } : {}),
    })),
  };
  return `import type { FinanceDefinition } from "@kesarcloud/plugin-finance-core";\n\nexport const definition: FinanceDefinition = ${JSON.stringify(definition, null, 2)};\n`;
}

async function writePlugin(plugin) {
  const targetDir = path.join(root, "packages/plugins", plugin.slug);
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.join(targetDir, "src/ui"), { recursive: true });
  const packageJson = {
    name: `@kesarcloud/plugin-${plugin.slug}`,
    version: "0.1.0",
    description: `First-party PaperClaw plugin for ${plugin.displayName} finance tools.`,
    type: "module",
    private: true,
    exports: { ".": "./src/index.ts" },
    paperclawPlugin: { manifest: "./dist/manifest.js", worker: "./dist/worker.js", ui: "./dist/ui/" },
    scripts: {
      prebuild: "pnpm --filter @kesarcloud/plugin-sdk ensure-build-deps",
      build: "tsc",
      clean: "rm -rf dist",
      test: `cd ../../.. && vitest run --project @kesarcloud/plugin-${plugin.slug}`,
      typecheck: "pnpm --filter @kesarcloud/plugin-sdk ensure-build-deps && tsc --noEmit",
    },
    dependencies: {
      "@kesarcloud/plugin-finance-core": "workspace:*",
      "@kesarcloud/plugin-sdk": "workspace:*",
    },
    devDependencies: commonDevDeps,
    peerDependencies: { react: ">=18" },
  };
  await fs.writeFile(path.join(targetDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
  await fs.writeFile(path.join(targetDir, "tsconfig.json"), `${JSON.stringify({
    extends: "../../../tsconfig.json",
    compilerOptions: { outDir: "dist", rootDir: "src", lib: ["ES2023", "DOM"], jsx: "react-jsx" },
    include: ["src"],
    exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
  }, null, 2)}\n`);
  await fs.writeFile(path.join(targetDir, "vitest.config.ts"), `import { defineConfig } from "vitest/config";\n\nexport default defineConfig({\n  test: {\n    name: "@kesarcloud/plugin-${plugin.slug}",\n    environment: "node",\n    include: ["src/**/*.test.ts"],\n  },\n});\n`);
  await fs.writeFile(path.join(targetDir, "src/definition.ts"), definitionSource(plugin));
  await fs.writeFile(path.join(targetDir, "src/manifest.ts"), `import { createFinanceManifest } from "@kesarcloud/plugin-finance-core";\nimport { definition } from "./definition.js";\n\nexport default createFinanceManifest(definition);\n`);
  await fs.writeFile(path.join(targetDir, "src/worker.ts"), `import { createFinancePlugin, runFinanceWorker } from "@kesarcloud/plugin-finance-core";\nimport { definition } from "./definition.js";\n\nconst plugin = createFinancePlugin(definition);\n\nexport default plugin;\nrunFinanceWorker(definition, import.meta.url);\n`);
  await fs.writeFile(path.join(targetDir, "src/index.ts"), `export { default as manifest } from "./manifest.js";\nexport { default as plugin } from "./worker.js";\n`);
  await fs.writeFile(path.join(targetDir, "src/ui/index.tsx"), `import { createFinanceUi } from "@kesarcloud/plugin-finance-core/ui";\nimport { definition } from "../definition.js";\n\nexport const {\n  FinanceDashboardWidget,\n  FinancePage,\n  FinanceSettingsPage,\n} = createFinanceUi(definition, definition.id);\n`);
  const mutatingEndpoint = plugin.endpoints.find((endpoint) => endpoint[5]);
  const params = {};
  for (const key of mutatingEndpoint[6] ?? []) params[key] = "example";
  if (mutatingEndpoint[8]) params[mutatingEndpoint[8]] = { amount: 1000, currency: "USD", name: "Example" };
  await fs.writeFile(path.join(targetDir, "src/worker.test.ts"), `import { describe, expect, it, vi } from "vitest";\nimport { createTestHarness } from "@kesarcloud/plugin-sdk/testing";\nimport manifest from "./manifest.js";\nimport plugin from "./worker.js";\nimport { definition } from "./definition.js";\n\nconst runCtx = {\n  companyId: "company-1",\n  projectId: "project-1",\n  agentId: "agent-1",\n  runId: "run-1",\n};\n\ndescribe("${plugin.displayName} finance plugin", () => {\n  it("declares finance category and core tools", () => {\n    expect(manifest.categories).toContain("finance");\n    expect(manifest.tools?.map((tool) => tool.name)).toContain(\`\${definition.routePath}.apiRequest\`);\n  });\n\n  it("prepares mutating requests without calling external APIs in dry-run mode", async () => {\n    const fetchSpy = vi.spyOn(globalThis, "fetch");\n    const harness = createTestHarness({\n      manifest,\n      config: {\n        authMode: "token",\n        accessTokenSecretRef: "00000000-0000-4000-8000-000000000001",\n        connectedCompanyId: runCtx.companyId,\n        dryRun: true,\n      },\n    });\n    await plugin.definition.setup(harness.ctx);\n\n    const result = await harness.executeTool("${plugin.slug}.${mutatingEndpoint[0]}", ${JSON.stringify(params, null, 6)}, runCtx);\n\n    expect(result.content).toContain("Dry run");\n    expect(fetchSpy).not.toHaveBeenCalled();\n    expect(result.data).toMatchObject({ dryRun: true });\n  });\n});\n`);
}

async function main() {
  await copyFinanceCore();
  for (const plugin of plugins) await writePlugin(plugin);
}

await main();
