import http from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  categorySlugs?: string[];
  sourceUrl: string | null;
  installSource: string | null;
  trustLevel: "markdown_only" | "assets" | "scripts_executables" | "unknown";
  tags: string[];
  installedSkillId: null;
  markdown: string | null;
  installNotes: string | null;
};

type Plugin = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  categorySlugs?: string[];
  packageName: string;
  version: string | null;
  sourceType: "bundled" | "npm";
  localPath: string | null;
  tags: string[];
  capabilities: string[];
  toolCount: number;
  uiSlotCount: number;
  jobCount: number;
  webhookCount: number;
  installedPluginId: null;
  installedStatus: null;
  markdown: string | null;
  installNotes: string | null;
};

type Component = {
  id: string;
  name: string;
  installedId: null;
  status: null;
};

type Pack = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  categorySlugs?: string[];
  tags: string[];
  plugin: Component | null;
  skills: Component[];
  defaultAssignMode: "library_only" | "ceo" | "all_agents" | "selected_agents";
  installed: false;
  needsSetup: true;
  markdown: string | null;
  installNotes: string | null;
  checklist: Array<{
    key: string;
    label: string;
    status: "needs_action";
    required: boolean;
    href: string | null;
  }>;
};

const marketplaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(marketplaceRoot, "..");
const port = Number.parseInt(process.env.PORT ?? process.env.MARKETPLACE_PORT ?? "8086", 10);

function skillPath(slug: string, category = "tools") {
  return path.join(marketplaceRoot, "skills", category, slug);
}

function pluginPath(slug: string) {
  return path.join(repoRoot, "packages", "plugins", slug);
}

function readSkillMarkdown(slug: string, category = "tools") {
  return readFileSync(path.join(skillPath(slug, category), "SKILL.md"), "utf8");
}

const categoryNames: Record<string, string> = {
  tools: "Tools",
  communication: "Communication",
  "courier-logistics": "Courier & Logistics",
  developer: "Developer",
  ecommerce: "Ecommerce",
  "real-estate": "Real Estate",
  finance: "Finance",
  "legal-law": "Legal & Law",
  legal_law: "Legal & Law",
  productivity: "Productivity",
};

const categoryAliases: Record<string, string> = {
  "legal-law": "legal_law",
  legal: "legal_law",
  "legal-and-law": "legal_law",
  dev: "developer",
  "developer-tools": "developer",
  fintech: "finance",
};

function normalizeCategorySlug(category: string | null) {
  if (!category) return null;
  const normalized = category.trim().toLowerCase().replace(/[\s_&]+/g, "-");
  return categoryAliases[normalized] ?? categoryAliases[category] ?? category;
}

const productivityDefinitions = [
  {
    slug: "notion",
    name: "Notion",
    description: "Notion productivity connector for pages, databases, comments, search, and workspace knowledge workflows.",
    packageName: "@kesarcloud/plugin-notion",
    tags: ["notion", "docs", "knowledge", "productivity"],
    capabilities: ["pages", "databases", "comments", "search"],
  },
  {
    slug: "slack",
    name: "Slack",
    description: "Slack productivity connector for channels, messages, users, threads, and team communication workflows.",
    packageName: "@kesarcloud/plugin-slack",
    tags: ["slack", "chat", "communication", "productivity"],
    capabilities: ["channels", "messages", "users", "threads"],
  },
  {
    slug: "asana",
    name: "Asana",
    description: "Asana productivity connector for projects, tasks, comments, users, and team work management.",
    packageName: "@kesarcloud/plugin-asana",
    tags: ["asana", "tasks", "projects", "productivity"],
    capabilities: ["projects", "tasks", "comments", "users"],
  },
  {
    slug: "trello",
    name: "Trello",
    description: "Trello productivity connector for boards, lists, cards, comments, and kanban workflows.",
    packageName: "@kesarcloud/plugin-trello",
    tags: ["trello", "kanban", "cards", "productivity"],
    capabilities: ["boards", "lists", "cards", "comments"],
  },
  {
    slug: "clickup",
    name: "ClickUp",
    description: "ClickUp productivity connector for spaces, folders, lists, tasks, comments, and work tracking.",
    packageName: "@kesarcloud/plugin-clickup",
    tags: ["clickup", "tasks", "projects", "productivity"],
    capabilities: ["spaces", "lists", "tasks", "comments"],
  },
  {
    slug: "todoist",
    name: "Todoist",
    description: "Todoist productivity connector for projects, tasks, sections, comments, and personal work queues.",
    packageName: "@kesarcloud/plugin-todoist",
    tags: ["todoist", "tasks", "productivity"],
    capabilities: ["projects", "tasks", "sections", "comments"],
  },
  {
    slug: "linear",
    name: "Linear",
    description: "Linear productivity connector for teams, projects, issues, comments, and engineering planning.",
    packageName: "@kesarcloud/plugin-linear",
    tags: ["linear", "issues", "engineering", "productivity"],
    capabilities: ["teams", "projects", "issues", "comments"],
  },
  {
    slug: "monday",
    name: "Monday.com",
    description: "Monday.com productivity connector for boards, groups, items, updates, and operational work tracking.",
    packageName: "@kesarcloud/plugin-monday",
    tags: ["monday", "boards", "operations", "productivity"],
    capabilities: ["boards", "groups", "items", "updates"],
  },
  {
    slug: "microsoft-365",
    name: "Microsoft 365",
    description: "Microsoft 365 productivity connector for mail, calendar, files, chats, and organizational workflows.",
    packageName: "@kesarcloud/plugin-microsoft-365",
    tags: ["microsoft-365", "office", "mail", "productivity"],
    capabilities: ["mail", "calendar", "files", "chats"],
  },
  {
    slug: "jira",
    name: "Jira",
    description: "Jira productivity connector for projects, issues, transitions, comments, and software delivery workflows.",
    packageName: "@kesarcloud/plugin-jira",
    tags: ["jira", "issues", "software", "productivity"],
    capabilities: ["projects", "issues", "transitions", "comments"],
  },
  {
    slug: "confluence",
    name: "Confluence",
    description: "Confluence productivity connector for spaces, pages, comments, search, and team documentation.",
    packageName: "@kesarcloud/plugin-confluence",
    tags: ["confluence", "docs", "wiki", "productivity"],
    capabilities: ["spaces", "pages", "comments", "search"],
  },
  {
    slug: "airtable",
    name: "Airtable",
    description: "Airtable productivity connector for bases, tables, records, fields, and lightweight operations workflows.",
    packageName: "@kesarcloud/plugin-airtable",
    tags: ["airtable", "database", "records", "productivity"],
    capabilities: ["bases", "tables", "records", "fields"],
  },
] as const;

const legalDefinitions = [
  {
    slug: "clio",
    name: "Clio",
    description: "Clio legal practice connector for contacts, matters, activities, tasks, documents, bills, and users.",
    packageName: "@kesarcloud/plugin-clio",
    tags: ["clio", "legal", "law", "practice-management"],
    capabilities: ["contacts", "matters", "tasks", "documents"],
  },
  {
    slug: "filevine",
    name: "Filevine",
    description: "Filevine legal operations connector for projects, contacts, tasks, notes, documents, collections, and search.",
    packageName: "@kesarcloud/plugin-filevine",
    tags: ["filevine", "legal", "law", "case-management"],
    capabilities: ["projects", "contacts", "tasks", "documents"],
  },
  {
    slug: "docusign",
    name: "DocuSign",
    description: "DocuSign eSignature connector for envelopes, templates, recipients, documents, status, and tabs.",
    packageName: "@kesarcloud/plugin-docusign",
    tags: ["docusign", "esignature", "legal", "documents"],
    capabilities: ["envelopes", "templates", "recipients", "documents"],
  },
  {
    slug: "adobe-sign",
    name: "Adobe Sign",
    description: "Adobe Acrobat Sign connector for agreements, transient documents, templates, users, and reminders.",
    packageName: "@kesarcloud/plugin-adobe-sign",
    tags: ["adobe-sign", "esignature", "legal", "agreements"],
    capabilities: ["agreements", "templates", "users", "reminders"],
  },
  {
    slug: "pandadoc",
    name: "PandaDoc",
    description: "PandaDoc document workflow connector for documents, templates, contacts, recipients, folders, and status.",
    packageName: "@kesarcloud/plugin-pandadoc",
    tags: ["pandadoc", "documents", "esignature", "legal"],
    capabilities: ["documents", "templates", "contacts", "folders"],
  },
  {
    slug: "netdocuments",
    name: "NetDocuments",
    description: "NetDocuments DMS connector for cabinets, workspaces, folders, documents, profiles, and search.",
    packageName: "@kesarcloud/plugin-netdocuments",
    tags: ["netdocuments", "dms", "legal", "documents"],
    capabilities: ["cabinets", "workspaces", "documents", "search"],
  },
  {
    slug: "imanage",
    name: "iManage",
    description: "iManage Work connector for libraries, workspaces, folders, documents, users, and profile metadata.",
    packageName: "@kesarcloud/plugin-imanage",
    tags: ["imanage", "dms", "legal", "documents"],
    capabilities: ["libraries", "workspaces", "documents", "search"],
  },
  {
    slug: "relativity",
    name: "Relativity",
    description: "Relativity eDiscovery connector for workspaces, matters, documents, saved searches, and job status.",
    packageName: "@kesarcloud/plugin-relativity",
    tags: ["relativity", "ediscovery", "legal", "documents"],
    capabilities: ["workspaces", "documents", "saved-searches", "jobs"],
  },
  {
    slug: "everlaw",
    name: "Everlaw",
    description: "Everlaw eDiscovery connector for organizations, projects, documents, binders, productions, searches, and users.",
    packageName: "@kesarcloud/plugin-everlaw",
    tags: ["everlaw", "ediscovery", "legal", "projects"],
    capabilities: ["projects", "documents", "binders", "productions"],
  },
  {
    slug: "disco",
    name: "DISCO",
    description: "DISCO Ediscovery connector for organization datasets, metrics, metadata, and operational reporting.",
    packageName: "@kesarcloud/plugin-disco",
    tags: ["disco", "ediscovery", "legal", "reporting"],
    capabilities: ["datasets", "metrics", "metadata", "reporting"],
  },
  {
    slug: "legal-tracker",
    name: "Legal Tracker",
    description: "Thomson Reuters Legal Tracker connector for matters, invoices, firms, budgets, accruals, documents, and users.",
    packageName: "@kesarcloud/plugin-legal-tracker",
    tags: ["legal-tracker", "legal-ops", "billing", "law"],
    capabilities: ["matters", "invoices", "firms", "budgets"],
  },
  {
    slug: "lawmatics",
    name: "Lawmatics",
    description: "Lawmatics legal CRM connector for contacts, matters, automations, forms, events, tasks, and notes.",
    packageName: "@kesarcloud/plugin-lawmatics",
    tags: ["lawmatics", "legal-crm", "contacts", "law"],
    capabilities: ["contacts", "matters", "tasks", "automations"],
  },
] as const;

const financeDefinitions = [
  { slug: "quickbooks-online", name: "QuickBooks Online", description: "QuickBooks Online finance connector for customers, vendors, invoices, bills, payments, reports, and company data.", packageName: "@kesarcloud/plugin-quickbooks-online", tags: ["quickbooks", "accounting", "invoices", "finance"], capabilities: ["customers", "vendors", "invoices", "bills", "reports"] },
  { slug: "xero", name: "Xero", description: "Xero Accounting connector for tenants, contacts, invoices, bills, payments, accounts, items, and reports.", packageName: "@kesarcloud/plugin-xero", tags: ["xero", "accounting", "invoices", "finance"], capabilities: ["contacts", "invoices", "payments", "accounts", "reports"] },
  { slug: "zoho-books", name: "Zoho Books", description: "Zoho Books connector for organizations, contacts, invoices, bills, expenses, payments, items, and reports.", packageName: "@kesarcloud/plugin-zoho-books", tags: ["zoho-books", "accounting", "expenses", "finance"], capabilities: ["contacts", "invoices", "bills", "expenses", "payments"] },
  { slug: "freshbooks", name: "FreshBooks", description: "FreshBooks connector for clients, invoices, expenses, payments, estimates, projects, and reports.", packageName: "@kesarcloud/plugin-freshbooks", tags: ["freshbooks", "accounting", "invoices", "finance"], capabilities: ["clients", "invoices", "expenses", "payments", "projects"] },
  { slug: "bill", name: "BILL", description: "BILL connector for vendors, bills, payments, invoices, customers, chart of accounts, and AP/AR workflows.", packageName: "@kesarcloud/plugin-bill", tags: ["bill", "accounts-payable", "payments", "finance"], capabilities: ["vendors", "bills", "payments", "invoices", "customers"] },
  { slug: "netsuite", name: "NetSuite", description: "NetSuite connector for REST records, SuiteQL, customers, vendors, invoices, bills, payments, and journals.", packageName: "@kesarcloud/plugin-netsuite", tags: ["netsuite", "erp", "suiteql", "finance"], capabilities: ["suiteql", "records", "invoices", "bills", "journals"] },
  { slug: "plaid", name: "Plaid", description: "Plaid connector for accounts, balances, transactions, identity, institutions, Link tokens, and item status.", packageName: "@kesarcloud/plugin-plaid", tags: ["plaid", "banking", "transactions", "finance"], capabilities: ["accounts", "balances", "transactions", "identity", "institutions"] },
  { slug: "wise", name: "Wise", description: "Wise Platform connector for profiles, balances, rates, quotes, recipients, transfers, and statements.", packageName: "@kesarcloud/plugin-wise", tags: ["wise", "transfers", "fx", "finance"], capabilities: ["profiles", "balances", "rates", "quotes", "transfers"] },
  { slug: "brex", name: "Brex", description: "Brex connector for transactions, expenses, cards, vendors, payments, users, and budgets.", packageName: "@kesarcloud/plugin-brex", tags: ["brex", "cards", "expenses", "finance"], capabilities: ["transactions", "expenses", "cards", "vendors", "payments"] },
  { slug: "paypal", name: "PayPal", description: "PayPal REST connector for invoices, orders, payments, captures, refunds, payouts, and webhooks.", packageName: "@kesarcloud/plugin-paypal", tags: ["paypal", "payments", "invoices", "finance"], capabilities: ["invoices", "orders", "payments", "refunds", "payouts"] },
  { slug: "adyen", name: "Adyen", description: "Adyen connector for payments, captures, refunds, payouts, transfers, balance platform, and reporting data.", packageName: "@kesarcloud/plugin-adyen", tags: ["adyen", "payments", "payouts", "finance"], capabilities: ["payments", "captures", "refunds", "payouts", "transfers"] },
  { slug: "expensify", name: "Expensify", description: "Expensify connector for expense reports, users, policies, exports, and reimbursement workflows.", packageName: "@kesarcloud/plugin-expensify", tags: ["expensify", "expenses", "reports", "finance"], capabilities: ["reports", "expenses", "policies", "employees", "reimbursements"] },
] as const;

const developerDefinitions = [
  { slug: "figma", name: "Figma", description: "Figma developer connector for files, projects, comments, components, styles, variables, dev resources, and webhooks.", packageName: "@kesarcloud/plugin-figma", tags: ["figma", "design", "ui", "handoff"], capabilities: ["files", "projects", "comments", "components", "variables"] },
  { slug: "miro", name: "Miro", description: "Miro developer connector for boards, board items, frames, comments, tags, and collaborative design planning.", packageName: "@kesarcloud/plugin-miro", tags: ["miro", "whiteboard", "design", "collaboration"], capabilities: ["boards", "items", "comments", "frames"] },
  { slug: "webflow", name: "Webflow", description: "Webflow developer connector for sites, pages, collections, items, assets, forms, and publish workflows.", packageName: "@kesarcloud/plugin-webflow", tags: ["webflow", "cms", "website", "design"], capabilities: ["sites", "pages", "collections", "items", "assets"] },
  { slug: "github", name: "GitHub", description: "GitHub developer connector for repositories, issues, pull requests, branches, actions, releases, and code search.", packageName: "@kesarcloud/plugin-github", tags: ["github", "git", "ci", "code"], capabilities: ["repositories", "issues", "pull-requests", "actions", "releases"] },
  { slug: "gitlab", name: "GitLab", description: "GitLab developer connector for projects, issues, merge requests, pipelines, jobs, releases, and repository files.", packageName: "@kesarcloud/plugin-gitlab", tags: ["gitlab", "git", "ci", "code"], capabilities: ["projects", "issues", "merge-requests", "pipelines", "releases"] },
  { slug: "bitbucket", name: "Bitbucket", description: "Bitbucket Cloud developer connector for workspaces, repositories, pull requests, issues, pipelines, and deployments.", packageName: "@kesarcloud/plugin-bitbucket", tags: ["bitbucket", "git", "pipelines", "code"], capabilities: ["repositories", "pull-requests", "issues", "pipelines"] },
  { slug: "azure-devops", name: "Azure DevOps", description: "Azure DevOps connector for projects, repositories, work items, pull requests, builds, releases, and pipelines.", packageName: "@kesarcloud/plugin-azure-devops", tags: ["azure-devops", "git", "pipelines", "work-items"], capabilities: ["projects", "repositories", "work-items", "pull-requests", "builds"] },
  { slug: "vercel", name: "Vercel", description: "Vercel developer connector for teams, projects, deployments, aliases, environment variables, domains, and checks.", packageName: "@kesarcloud/plugin-vercel", tags: ["vercel", "deploy", "frontend", "hosting"], capabilities: ["projects", "deployments", "env-vars", "domains", "aliases"] },
  { slug: "netlify", name: "Netlify", description: "Netlify developer connector for sites, deploys, forms, functions, environment variables, domains, and build hooks.", packageName: "@kesarcloud/plugin-netlify", tags: ["netlify", "deploy", "jamstack", "hosting"], capabilities: ["sites", "deploys", "forms", "env-vars", "hooks"] },
  { slug: "render", name: "Render", description: "Render developer connector for services, deploys, environment variables, custom domains, jobs, and service events.", packageName: "@kesarcloud/plugin-render", tags: ["render", "deploy", "backend", "hosting"], capabilities: ["services", "deploys", "env-vars", "domains", "jobs"] },
  { slug: "supabase", name: "Supabase", description: "Supabase developer connector for organizations, projects, branches, API keys, functions, and storage.", packageName: "@kesarcloud/plugin-supabase", tags: ["supabase", "backend", "database", "edge-functions"], capabilities: ["organizations", "projects", "branches", "functions", "storage"] },
  { slug: "cloudflare", name: "Cloudflare", description: "Cloudflare developer connector for accounts, zones, DNS, Workers, Pages, KV, R2, and firewall rules.", packageName: "@kesarcloud/plugin-cloudflare", tags: ["cloudflare", "workers", "dns", "edge"], capabilities: ["accounts", "zones", "dns", "workers", "pages"] },
  { slug: "digitalocean", name: "DigitalOcean", description: "DigitalOcean developer connector for apps, droplets, databases, domains, Kubernetes clusters, images, and projects.", packageName: "@kesarcloud/plugin-digitalocean", tags: ["digitalocean", "cloud", "apps", "kubernetes"], capabilities: ["apps", "droplets", "databases", "domains", "kubernetes"] },
  { slug: "hasura", name: "Hasura", description: "Hasura developer connector for metadata, query execution, sources, actions, events, and permissions.", packageName: "@kesarcloud/plugin-hasura", tags: ["hasura", "graphql", "backend", "metadata"], capabilities: ["metadata", "graphql", "sources", "actions", "events"] },
  { slug: "appwrite", name: "Appwrite", description: "Appwrite developer connector for projects, databases, collections, documents, users, teams, functions, and storage.", packageName: "@kesarcloud/plugin-appwrite", tags: ["appwrite", "backend", "database", "functions"], capabilities: ["databases", "collections", "documents", "users", "functions"] },
  { slug: "postman", name: "Postman", description: "Postman developer connector for workspaces, collections, environments, APIs, monitors, mocks, and test runs.", packageName: "@kesarcloud/plugin-postman", tags: ["postman", "api", "testing", "collections"], capabilities: ["workspaces", "collections", "environments", "monitors", "mocks"] },
  { slug: "sentry", name: "Sentry", description: "Sentry developer connector for organizations, projects, issues, events, releases, teams, alerts, and performance data.", packageName: "@kesarcloud/plugin-sentry", tags: ["sentry", "errors", "observability", "releases"], capabilities: ["organizations", "projects", "issues", "events", "releases"] },
  { slug: "grafana", name: "Grafana", description: "Grafana developer connector for dashboards, folders, datasources, alerts, annotations, and service accounts.", packageName: "@kesarcloud/plugin-grafana", tags: ["grafana", "observability", "dashboards", "alerts"], capabilities: ["dashboards", "folders", "datasources", "alerts", "annotations"] },
  { slug: "snyk", name: "Snyk", description: "Snyk developer connector for organizations, projects, targets, issues, dependencies, reporting, and vulnerability workflows.", packageName: "@kesarcloud/plugin-snyk", tags: ["snyk", "security", "vulnerabilities", "dependencies"], capabilities: ["organizations", "projects", "targets", "issues", "reports"] },
  { slug: "sonarcloud", name: "SonarCloud", description: "SonarCloud developer connector for projects, issues, quality gates, measures, components, and analysis status.", packageName: "@kesarcloud/plugin-sonarcloud", tags: ["sonarcloud", "quality", "static-analysis", "code"], capabilities: ["projects", "issues", "quality-gates", "measures", "components"] },
  { slug: "browserstack", name: "BrowserStack", description: "BrowserStack developer connector for browser/device capability discovery, sessions, builds, projects, app uploads, and test observability.", packageName: "@kesarcloud/plugin-browserstack", tags: ["browserstack", "testing", "browsers", "devices"], capabilities: ["sessions", "builds", "projects", "devices", "test-observability"] },
] as const;

const logisticsDefinitions = [
  {
    slug: "shippo",
    name: "Shippo",
    description: "Shippo logistics connector for rates, shipments, labels, tracking, address validation, and carrier workflows.",
    packageName: "@kesarcloud/plugin-shippo",
    tags: ["shippo", "shipping", "logistics", "labels"],
    capabilities: ["rates", "shipments", "labels", "tracking"],
  },
  {
    slug: "easypost",
    name: "EasyPost",
    description: "EasyPost logistics connector for rates, shipments, labels, tracking, pickups, and address verification.",
    packageName: "@kesarcloud/plugin-easypost",
    tags: ["easypost", "shipping", "logistics", "tracking"],
    capabilities: ["rates", "shipments", "labels", "tracking"],
  },
  {
    slug: "shipengine",
    name: "ShipEngine",
    description: "ShipEngine logistics connector for carriers, rates, shipments, labels, tracking, and address validation.",
    packageName: "@kesarcloud/plugin-shipengine",
    tags: ["shipengine", "shipping", "logistics", "carriers"],
    capabilities: ["carriers", "rates", "labels", "tracking"],
  },
  {
    slug: "aftership",
    name: "AfterShip",
    description: "AfterShip tracking connector for couriers, tracking creation, tracking lookup, and webhook workflows.",
    packageName: "@kesarcloud/plugin-aftership",
    tags: ["aftership", "tracking", "courier", "logistics"],
    capabilities: ["couriers", "tracking", "webhooks"],
  },
  {
    slug: "fedex",
    name: "FedEx",
    description: "FedEx logistics connector for rates, shipments, labels, tracking, pickups, and address validation.",
    packageName: "@kesarcloud/plugin-fedex",
    tags: ["fedex", "carrier", "shipping", "logistics"],
    capabilities: ["rates", "shipments", "labels", "tracking"],
  },
  {
    slug: "ups",
    name: "UPS",
    description: "UPS logistics connector for rating, shipping, labels, tracking, pickup, and address validation.",
    packageName: "@kesarcloud/plugin-ups",
    tags: ["ups", "carrier", "shipping", "logistics"],
    capabilities: ["rates", "shipments", "labels", "tracking"],
  },
  {
    slug: "dhl-express",
    name: "DHL Express",
    description: "DHL Express logistics connector for rates, shipments, labels, pickups, tracking, and address validation.",
    packageName: "@kesarcloud/plugin-dhl-express",
    tags: ["dhl", "express", "carrier", "logistics"],
    capabilities: ["rates", "shipments", "labels", "tracking"],
  },
  {
    slug: "usps",
    name: "USPS",
    description: "USPS logistics connector for prices, labels, tracking, carrier pickup, and address verification.",
    packageName: "@kesarcloud/plugin-usps",
    tags: ["usps", "carrier", "shipping", "logistics"],
    capabilities: ["rates", "labels", "tracking", "addresses"],
  },
  {
    slug: "delhivery",
    name: "Delhivery",
    description: "Delhivery connector for Indian ecommerce waybills, shipments, labels, tracking, pickups, rates, and serviceability.",
    packageName: "@kesarcloud/plugin-delhivery",
    tags: ["delhivery", "india", "shipping", "logistics"],
    capabilities: ["rates", "shipments", "labels", "tracking"],
  },
  {
    slug: "shiprocket",
    name: "Shiprocket",
    description: "Shiprocket connector for Indian ecommerce couriers, rates, orders, AWB labels, pickups, tracking, and serviceability.",
    packageName: "@kesarcloud/plugin-shiprocket",
    tags: ["shiprocket", "india", "shipping", "logistics"],
    capabilities: ["couriers", "rates", "labels", "tracking"],
  },
] as const;



const communicationDefinitions = [
  {
    "slug": "sendgrid",
    "name": "SendGrid",
    "description": "SendGrid connector for transactional email, templates, suppressions, sender identities, and email activity workflows.",
    "packageName": "@kesarcloud/plugin-sendgrid",
    "tags": [
      "sendgrid",
      "email",
      "transactional",
      "communication"
    ],
    "capabilities": [
      "email-send",
      "templates",
      "suppressions",
      "sender-identities"
    ]
  },
  {
    "slug": "mailgun",
    "name": "Mailgun",
    "description": "Mailgun connector for email sending, validation, domains, suppressions, templates, and events.",
    "packageName": "@kesarcloud/plugin-mailgun",
    "tags": [
      "mailgun",
      "email",
      "transactional",
      "communication"
    ],
    "capabilities": [
      "email-send",
      "domains",
      "templates",
      "events",
      "suppressions"
    ]
  },
  {
    "slug": "postmark",
    "name": "Postmark",
    "description": "Postmark connector for transactional email, templates, servers, sender signatures, suppressions, and message activity.",
    "packageName": "@kesarcloud/plugin-postmark",
    "tags": [
      "postmark",
      "email",
      "transactional",
      "communication"
    ],
    "capabilities": [
      "email-send",
      "templates",
      "servers",
      "suppressions"
    ]
  },
  {
    "slug": "resend",
    "name": "Resend",
    "description": "Resend connector for email sending, domains, API keys, audiences, contacts, and broadcast workflows.",
    "packageName": "@kesarcloud/plugin-resend",
    "tags": [
      "resend",
      "email",
      "broadcasts",
      "communication"
    ],
    "capabilities": [
      "email-send",
      "domains",
      "contacts",
      "audiences",
      "broadcasts"
    ]
  },
  {
    "slug": "amazon-ses",
    "name": "Amazon SES",
    "description": "Amazon SES v2 connector for email send, templates, identities, suppression lists, and account sending status.",
    "packageName": "@kesarcloud/plugin-amazon-ses",
    "tags": [
      "amazon-ses",
      "email",
      "aws",
      "communication"
    ],
    "capabilities": [
      "email-send",
      "templates",
      "identities",
      "suppression-list"
    ]
  },
  {
    "slug": "brevo",
    "name": "Brevo",
    "description": "Brevo connector for transactional email, contacts, campaigns, senders, templates, and WhatsApp campaign workflows.",
    "packageName": "@kesarcloud/plugin-brevo",
    "tags": [
      "brevo",
      "email",
      "marketing",
      "communication"
    ],
    "capabilities": [
      "email-send",
      "contacts",
      "campaigns",
      "templates",
      "senders"
    ]
  },
  {
    "slug": "meta-whatsapp-cloud",
    "name": "Meta WhatsApp Cloud API",
    "description": "Meta WhatsApp Cloud API connector for messages, templates, media, phone numbers, and business profile workflows.",
    "packageName": "@kesarcloud/plugin-meta-whatsapp-cloud",
    "tags": [
      "whatsapp",
      "meta",
      "cloud-api",
      "communication"
    ],
    "capabilities": [
      "whatsapp-send",
      "templates",
      "media",
      "business-profile"
    ]
  },
  {
    "slug": "twilio",
    "name": "Twilio",
    "description": "Twilio connector for SMS, WhatsApp, RCS-capable Messaging, calls, conferences, recordings, and message services.",
    "packageName": "@kesarcloud/plugin-twilio",
    "tags": [
      "twilio",
      "sms",
      "whatsapp",
      "voice",
      "rcs"
    ],
    "capabilities": [
      "sms",
      "whatsapp",
      "voice-calls",
      "messaging-services",
      "recordings"
    ]
  },
  {
    "slug": "google-rcs-business-messaging",
    "name": "Google RCS Business Messaging",
    "description": "Google RCS Business Messaging connector for RBM messages, events, files, testers, and agent launch workflows.",
    "packageName": "@kesarcloud/plugin-google-rcs-business-messaging",
    "tags": [
      "google",
      "rcs",
      "rbm",
      "communication"
    ],
    "capabilities": [
      "rcs-send",
      "events",
      "files",
      "testers",
      "agents"
    ]
  },
  {
    "slug": "sinch",
    "name": "Sinch",
    "description": "Sinch Conversation API connector for WhatsApp, RCS, SMS, channels, contacts, messages, and webhooks.",
    "packageName": "@kesarcloud/plugin-sinch",
    "tags": [
      "sinch",
      "whatsapp",
      "rcs",
      "sms",
      "communication"
    ],
    "capabilities": [
      "conversation-api",
      "whatsapp",
      "rcs",
      "sms",
      "webhooks"
    ]
  },
  {
    "slug": "infobip",
    "name": "Infobip",
    "description": "Infobip connector for WhatsApp, RCS, SMS, email, voice, messages, reports, templates, and senders.",
    "packageName": "@kesarcloud/plugin-infobip",
    "tags": [
      "infobip",
      "whatsapp",
      "rcs",
      "sms",
      "email",
      "voice"
    ],
    "capabilities": [
      "whatsapp",
      "rcs",
      "sms",
      "email",
      "voice",
      "reports"
    ]
  },
  {
    "slug": "vonage",
    "name": "Vonage",
    "description": "Vonage connector for Messages API, WhatsApp, SMS, Viber, Messenger, voice calls, and verification workflows.",
    "packageName": "@kesarcloud/plugin-vonage",
    "tags": [
      "vonage",
      "whatsapp",
      "sms",
      "voice",
      "communication"
    ],
    "capabilities": [
      "messages-api",
      "whatsapp",
      "sms",
      "voice",
      "verify"
    ]
  },
  {
    "slug": "gupshup",
    "name": "Gupshup",
    "description": "Gupshup connector for WhatsApp Business messaging, templates, app management, opt-ins, and message status workflows.",
    "packageName": "@kesarcloud/plugin-gupshup",
    "tags": [
      "gupshup",
      "whatsapp",
      "india",
      "communication"
    ],
    "capabilities": [
      "whatsapp-send",
      "templates",
      "opt-ins",
      "status"
    ]
  },
  {
    "slug": "plivo",
    "name": "Plivo",
    "description": "Plivo connector for SMS, WhatsApp, voice calls, numbers, message logs, recordings, and compliance workflows.",
    "packageName": "@kesarcloud/plugin-plivo",
    "tags": [
      "plivo",
      "sms",
      "whatsapp",
      "voice",
      "communication"
    ],
    "capabilities": [
      "sms",
      "whatsapp",
      "voice",
      "numbers",
      "recordings"
    ]
  },
  {
    "slug": "vapi",
    "name": "Vapi",
    "description": "Vapi connector for AI voice assistants, phone calls, phone numbers, call logs, and campaign-style voice workflows.",
    "packageName": "@kesarcloud/plugin-vapi",
    "tags": [
      "vapi",
      "ai-calling",
      "voice",
      "communication"
    ],
    "capabilities": [
      "ai-calls",
      "assistants",
      "phone-numbers",
      "call-logs"
    ]
  },
  {
    "slug": "retell-ai",
    "name": "Retell AI",
    "description": "Retell AI connector for AI phone calls, agents, phone numbers, call analysis, and voice automation workflows.",
    "packageName": "@kesarcloud/plugin-retell-ai",
    "tags": [
      "retell-ai",
      "ai-calling",
      "voice",
      "communication"
    ],
    "capabilities": [
      "ai-calls",
      "agents",
      "phone-numbers",
      "call-analysis"
    ]
  },
  {
    "slug": "bland-ai",
    "name": "Bland AI",
    "description": "Bland AI connector for AI phone calls, pathways, campaigns, phone numbers, transcripts, and call analysis.",
    "packageName": "@kesarcloud/plugin-bland-ai",
    "tags": [
      "bland-ai",
      "ai-calling",
      "voice",
      "communication"
    ],
    "capabilities": [
      "ai-calls",
      "campaigns",
      "pathways",
      "transcripts"
    ]
  },
  {
    "slug": "exotel",
    "name": "Exotel",
    "description": "Exotel connector for Indian voice calls, SMS, WhatsApp, call details, recordings, and virtual number workflows.",
    "packageName": "@kesarcloud/plugin-exotel",
    "tags": [
      "exotel",
      "india",
      "voice",
      "sms",
      "whatsapp"
    ],
    "capabilities": [
      "voice-calls",
      "sms",
      "whatsapp",
      "recordings",
      "numbers"
    ]
  }
] as const;

const realEstateDefinitions = [
  {
    "slug": "rentcast",
    "name": "RentCast",
    "description": "RentCast connector for US property records, sale/rental listings, AVM values, and market data.",
    "packageName": "@kesarcloud/plugin-rentcast",
    "tags": [
      "rentcast",
      "usa",
      "property-data",
      "avm"
    ],
    "capabilities": [
      "properties",
      "listings",
      "avm",
      "markets"
    ]
  },
  {
    "slug": "attom",
    "name": "ATTOM",
    "description": "ATTOM connector for US property profiles, sales, valuation, and assessment workflows.",
    "packageName": "@kesarcloud/plugin-attom",
    "tags": [
      "attom",
      "usa",
      "property-data",
      "valuation"
    ],
    "capabilities": [
      "property-profiles",
      "sales",
      "assessment",
      "valuation"
    ]
  },
  {
    "slug": "realie",
    "name": "Realie",
    "description": "Realie AI connector for property intelligence, comparables, valuation, and enrichment workflows.",
    "packageName": "@kesarcloud/plugin-realie",
    "tags": [
      "realie",
      "property-intelligence",
      "ai",
      "global"
    ],
    "capabilities": [
      "property-search",
      "comparables",
      "valuation",
      "enrichment"
    ]
  },
  {
    "slug": "anyprop",
    "name": "AnyProp RESO",
    "description": "AnyProp RESO connector for MLS-compatible property, member, office, and metadata resources.",
    "packageName": "@kesarcloud/plugin-anyprop",
    "tags": [
      "anyprop",
      "reso",
      "mls",
      "listings"
    ],
    "capabilities": [
      "reso-property",
      "members",
      "offices",
      "metadata"
    ]
  },
  {
    "slug": "reapit",
    "name": "Reapit Foundations",
    "description": "Reapit Foundations connector for UK agency properties, applicants, contacts, appointments, and offers.",
    "packageName": "@kesarcloud/plugin-reapit",
    "tags": [
      "reapit",
      "uk",
      "agency",
      "property-crm"
    ],
    "capabilities": [
      "properties",
      "applicants",
      "contacts",
      "appointments",
      "offers"
    ]
  },
  {
    "slug": "homedata-uk",
    "name": "Homedata UK",
    "description": "Homedata UK connector for UK residential property, valuation, planning, and local market data.",
    "packageName": "@kesarcloud/plugin-homedata-uk",
    "tags": [
      "homedata",
      "uk",
      "property-data",
      "valuation"
    ],
    "capabilities": [
      "property-data",
      "valuation",
      "planning",
      "market-data"
    ]
  },
  {
    "slug": "hm-land-registry",
    "name": "HM Land Registry",
    "description": "HM Land Registry connector for UK title, price paid, ownership, and property data workflows.",
    "packageName": "@kesarcloud/plugin-hm-land-registry",
    "tags": [
      "hm-land-registry",
      "uk",
      "land-registry",
      "title"
    ],
    "capabilities": [
      "title-data",
      "price-paid",
      "ownership",
      "property-data"
    ]
  },
  {
    "slug": "idealista",
    "name": "Idealista",
    "description": "Idealista connector for Spain, Italy, and Portugal property search and listing detail workflows.",
    "packageName": "@kesarcloud/plugin-idealista",
    "tags": [
      "idealista",
      "eu",
      "spain",
      "italy",
      "portugal"
    ],
    "capabilities": [
      "property-search",
      "listings",
      "detail",
      "market-data"
    ]
  },
  {
    "slug": "geoiq",
    "name": "GeoIQ",
    "description": "GeoIQ connector for Indian location intelligence, catchment analysis, scores, and geospatial enrichment.",
    "packageName": "@kesarcloud/plugin-geoiq",
    "tags": [
      "geoiq",
      "india",
      "location-intelligence",
      "geospatial"
    ],
    "capabilities": [
      "places",
      "catchments",
      "scores",
      "geospatial"
    ]
  },
  {
    "slug": "legiscore",
    "name": "LegiScore",
    "description": "LegiScore connector for Indian property due diligence, title, ownership, encumbrance, and compliance workflows.",
    "packageName": "@kesarcloud/plugin-legiscore",
    "tags": [
      "legiscore",
      "india",
      "due-diligence",
      "title"
    ],
    "capabilities": [
      "title-search",
      "ownership",
      "encumbrance",
      "compliance"
    ]
  },
  {
    "slug": "follow-up-boss",
    "name": "Follow Up Boss",
    "description": "Follow Up Boss connector for real-estate leads, people, events, notes, tasks, and CRM workflows.",
    "packageName": "@kesarcloud/plugin-follow-up-boss",
    "tags": [
      "follow-up-boss",
      "crm",
      "leads",
      "real-estate"
    ],
    "capabilities": [
      "people",
      "leads",
      "events",
      "tasks",
      "notes"
    ]
  },
  {
    "slug": "lofty",
    "name": "Lofty",
    "description": "Lofty connector for real-estate CRM leads, properties, tasks, activities, and agent workflows.",
    "packageName": "@kesarcloud/plugin-lofty",
    "tags": [
      "lofty",
      "crm",
      "leads",
      "real-estate"
    ],
    "capabilities": [
      "leads",
      "properties",
      "tasks",
      "activities"
    ]
  }
] as const;

const skills: Skill[] = [
  {
    id: "tools/research-protocol-tools",
    slug: "research-protocol-tools",
    name: "Research Protocol Tools",
    description: "Industry-standard research workflow for scoping, source validation, synthesis, and browser automation.",
    categorySlug: "tools",
    categoryName: "Tools",
    sourceUrl: null,
    installSource: skillPath("research-protocol-tools"),
    trustLevel: "markdown_only",
    tags: ["research", "browser", "verification", "protocol"],
    installedSkillId: null,
    markdown: readSkillMarkdown("research-protocol-tools"),
    installNotes: "Install this with the browser automation plugin for full research execution.",
  },
  {
    id: "tools/browser-automation-tools",
    slug: "browser-automation-tools",
    name: "Browser Automation Tools",
    description: "Use the browser automation plugin for navigation, screenshots, extraction, and task completion.",
    categorySlug: "tools",
    categoryName: "Tools",
    categorySlugs: ["tools", "developer"],
    sourceUrl: null,
    installSource: skillPath("browser-automation-tools"),
    trustLevel: "markdown_only",
    tags: ["browser", "playwright", "automation"],
    installedSkillId: null,
    markdown: readSkillMarkdown("browser-automation-tools"),
    installNotes: "Pair with the Playwright MCP plugin.",
  },
  {
    id: "tools/google-workspace-tools",
    slug: "google-workspace-tools",
    name: "Google Workspace Tools",
    description: "Operate Google Workspace tasks through plugin-backed tools and clear execution protocols.",
    categorySlug: "tools",
    categoryName: "Tools",
    sourceUrl: null,
    installSource: skillPath("google-workspace-tools"),
    trustLevel: "markdown_only",
    tags: ["google", "workspace", "docs", "gmail"],
    installedSkillId: null,
    markdown: readSkillMarkdown("google-workspace-tools"),
    installNotes: "Requires Google Workspace plugin credentials before production use.",
  },
  {
    id: "tools/meta-ads-tools",
    slug: "meta-ads-tools",
    name: "Meta Ads Tools",
    description: "Plan, inspect, and operate Meta Ads workflows with plugin-backed controls.",
    categorySlug: "tools",
    categoryName: "Tools",
    sourceUrl: null,
    installSource: skillPath("meta-ads-tools"),
    trustLevel: "markdown_only",
    tags: ["ads", "meta", "marketing"],
    installedSkillId: null,
    markdown: readSkillMarkdown("meta-ads-tools"),
    installNotes: "Requires Meta Ads plugin setup and account credentials.",
  },
  {
    id: "tools/appointment-booking-tools",
    slug: "appointment-booking-tools",
    name: "Appointment Booking Tools",
    description: "Execute appointment scheduling and booking workflows with confirmation-first protocols.",
    categorySlug: "tools",
    categoryName: "Tools",
    sourceUrl: null,
    installSource: skillPath("appointment-booking-tools"),
    trustLevel: "markdown_only",
    tags: ["calendar", "booking", "scheduling"],
    installedSkillId: null,
    markdown: readSkillMarkdown("appointment-booking-tools"),
    installNotes: "Requires appointment booking plugin credentials.",
  },
  {
    id: "tools/canva-tools",
    slug: "canva-tools",
    name: "Canva Tools",
    description: "Operate Canva Connect API workflows through plugin-backed tools and dry-run guardrails.",
    categorySlug: "tools",
    categoryName: "Tools",
    categorySlugs: ["tools", "developer"],
    sourceUrl: null,
    installSource: skillPath("canva-tools"),
    trustLevel: "markdown_only",
    tags: ["canva", "design", "creative", "assets"],
    installedSkillId: null,
    markdown: readSkillMarkdown("canva-tools"),
    installNotes: "Requires Canva plugin OAuth setup before live creative operations.",
  },
  {
    id: "ecommerce/shopify-tools",
    slug: "shopify-tools",
    name: "Shopify Tools",
    description: "Operate Shopify store, product, inventory, order, page, and webhook workflows through plugin-backed guardrails.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("shopify-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["shopify", "commerce", "store", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("shopify-tools", "ecommerce"),
    installNotes: "Requires Shopify app OAuth setup before live store operations.",
  },
  {
    id: "ecommerce/woocommerce-tools",
    slug: "woocommerce-tools",
    name: "WooCommerce Tools",
    description: "Operate WooCommerce product, inventory, order, customer, and store workflows through plugin-backed guardrails.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("woocommerce-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["woocommerce", "commerce", "store", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("woocommerce-tools", "ecommerce"),
    installNotes: "Requires WooCommerce REST API consumer key and secret references before live store operations.",
  },
  {
    id: "ecommerce/bigcommerce-tools",
    slug: "bigcommerce-tools",
    name: "BigCommerce Tools",
    description: "Operate BigCommerce catalog, inventory, order, customer, and store workflows through plugin-backed guardrails.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("bigcommerce-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["bigcommerce", "commerce", "catalog", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("bigcommerce-tools", "ecommerce"),
    installNotes: "Requires BigCommerce store hash and access token secret reference.",
  },
  {
    id: "ecommerce/adobe-commerce-tools",
    slug: "adobe-commerce-tools",
    name: "Adobe Commerce Tools",
    description: "Operate Adobe Commerce and Magento catalog, inventory, order, customer, and store workflows.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("adobe-commerce-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["adobe-commerce", "magento", "commerce", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("adobe-commerce-tools", "ecommerce"),
    installNotes: "Requires Adobe Commerce integration token secret reference.",
  },
  {
    id: "ecommerce/square-commerce-tools",
    slug: "square-commerce-tools",
    name: "Square Commerce Tools",
    description: "Operate Square catalog, inventory, order, customer, and location workflows through guarded tools.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("square-commerce-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["square", "commerce", "catalog", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("square-commerce-tools", "ecommerce"),
    installNotes: "Requires Square sandbox or production access token secret reference.",
  },
  {
    id: "ecommerce/commercetools-tools",
    slug: "commercetools-tools",
    name: "commercetools Tools",
    description: "Operate commercetools products, inventory, orders, customers, and project workflows.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("commercetools-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["commercetools", "commerce", "headless", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("commercetools-tools", "ecommerce"),
    installNotes: "Requires commercetools project key and access token secret reference.",
  },
  {
    id: "ecommerce/wix-ecommerce-tools",
    slug: "wix-ecommerce-tools",
    name: "Wix eCommerce Tools",
    description: "Operate Wix eCommerce product, inventory, order, customer, and site workflows.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("wix-ecommerce-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["wix", "ecommerce", "store", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("wix-ecommerce-tools", "ecommerce"),
    installNotes: "Requires Wix OAuth or API access token secret reference.",
  },
  {
    id: "ecommerce/ecwid-tools",
    slug: "ecwid-tools",
    name: "Ecwid Tools",
    description: "Operate Ecwid product, inventory, order, customer, and store workflows.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("ecwid-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["ecwid", "commerce", "store", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("ecwid-tools", "ecommerce"),
    installNotes: "Requires Ecwid store ID and access token secret reference.",
  },
  {
    id: "ecommerce/prestashop-tools",
    slug: "prestashop-tools",
    name: "PrestaShop Tools",
    description: "Operate PrestaShop product, stock, order, customer, and store workflows.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    sourceUrl: null,
    installSource: skillPath("prestashop-tools", "ecommerce"),
    trustLevel: "markdown_only",
    tags: ["prestashop", "commerce", "store", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("prestashop-tools", "ecommerce"),
    installNotes: "Requires PrestaShop Webservice key secret reference.",
  },
  {
    id: "tools/razorpay-tools",
    slug: "razorpay-tools",
    name: "Razorpay Tools",
    description: "Operate Razorpay merchant payment workflows through plugin-backed tools and dry-run guardrails.",
    categorySlug: "finance",
    categoryName: "Finance",
    sourceUrl: null,
    installSource: skillPath("razorpay-tools"),
    trustLevel: "markdown_only",
    tags: ["razorpay", "payments", "refunds", "orders"],
    installedSkillId: null,
    markdown: readSkillMarkdown("razorpay-tools"),
    installNotes: "Requires Razorpay Key ID, Key Secret reference, and webhook secret before live payment operations.",
  },
  {
    id: "tools/stripe-tools",
    slug: "stripe-tools",
    name: "Stripe Tools",
    description: "Operate Stripe Merchant Core workflows through plugin-backed tools and dry-run guardrails.",
    categorySlug: "finance",
    categoryName: "Finance",
    sourceUrl: null,
    installSource: skillPath("stripe-tools"),
    trustLevel: "markdown_only",
    tags: ["stripe", "payments", "refunds", "checkout"],
    installedSkillId: null,
    markdown: readSkillMarkdown("stripe-tools"),
    installNotes: "Requires Stripe secret key and webhook signing secret references before live payment operations.",
  },
  ...productivityDefinitions.map<Skill>((item) => ({
    id: `productivity/${item.slug}-tools`,
    slug: `${item.slug}-tools`,
    name: `${item.name} Tools`,
    description: `Use the PaperClaw ${item.name} productivity plugin through guarded agent tools.`,
    categorySlug: "productivity",
    categoryName: "Productivity",
    ...(["jira", "linear", "confluence"].includes(item.slug) ? { categorySlugs: ["productivity", "developer"] } : {}),
    sourceUrl: null,
    installSource: skillPath(`${item.slug}-tools`),
    trustLevel: "markdown_only",
    tags: [...item.tags],
    installedSkillId: null,
    markdown: readSkillMarkdown(`${item.slug}-tools`),
    installNotes: `Requires ${item.name} plugin credentials before live productivity operations.`,
  })),
  ...legalDefinitions.map<Skill>((item) => ({
    id: `legal_law/${item.slug}-tools`,
    slug: `${item.slug}-tools`,
    name: `${item.name} Tools`,
    description: `Use the PaperClaw ${item.name} Legal & Law plugin through guarded agent tools.`,
    categorySlug: "legal_law",
    categoryName: "Legal & Law",
    sourceUrl: null,
    installSource: skillPath(`${item.slug}-tools`),
    trustLevel: "markdown_only",
    tags: [...item.tags],
    installedSkillId: null,
    markdown: readSkillMarkdown(`${item.slug}-tools`),
    installNotes: `Requires ${item.name} plugin credentials before live legal operations.`,
  })),
  ...financeDefinitions.map<Skill>((item) => ({
    id: `finance/${item.slug}-tools`,
    slug: `${item.slug}-tools`,
    name: `${item.name} Tools`,
    description: `Use the PaperClaw ${item.name} Finance plugin through guarded agent tools.`,
    categorySlug: "finance",
    categoryName: "Finance",
    sourceUrl: null,
    installSource: skillPath(`${item.slug}-tools`, "finance"),
    trustLevel: "markdown_only",
    tags: [...item.tags],
    installedSkillId: null,
    markdown: readSkillMarkdown(`${item.slug}-tools`, "finance"),
    installNotes: `Requires ${item.name} plugin credentials before live finance operations.`,
  })),
  ...developerDefinitions.map<Skill>((item) => ({
    id: `developer/${item.slug}-tools`,
    slug: `${item.slug}-tools`,
    name: `${item.name} Tools`,
    description: `Use the PaperClaw ${item.name} Developer plugin through guarded agent tools.`,
    categorySlug: "developer",
    categoryName: "Developer",
    sourceUrl: null,
    installSource: skillPath(`${item.slug}-tools`, "developer"),
    trustLevel: "markdown_only",
    tags: [...item.tags],
    installedSkillId: null,
    markdown: readSkillMarkdown(`${item.slug}-tools`, "developer"),
    installNotes: `Requires ${item.name} plugin credentials before live developer-platform operations.`,
  })),
  ...logisticsDefinitions.map<Skill>((item) => ({
    id: `courier-logistics/${item.slug}-tools`,
    slug: `${item.slug}-tools`,
    name: `${item.name} Tools`,
    description: `Use the PaperClaw ${item.name} Courier & Logistics plugin through guarded agent tools.`,
    categorySlug: "courier-logistics",
    categoryName: "Courier & Logistics",
    sourceUrl: null,
    installSource: skillPath(`${item.slug}-tools`, "courier-logistics"),
    trustLevel: "markdown_only",
    tags: [...item.tags],
    installedSkillId: null,
    markdown: readSkillMarkdown(`${item.slug}-tools`, "courier-logistics"),
    installNotes: `Requires ${item.name} plugin credentials before live courier and logistics operations.`,
  })),
  ...realEstateDefinitions.map<Skill>((item) => ({
    id: `real-estate/${item.slug}-tools`,
    slug: `${item.slug}-tools`,
    name: `${item.name} Tools`,
    description: `Use the PaperClaw ${item.name} Real Estate plugin through guarded agent tools.`,
    categorySlug: "real-estate",
    categoryName: "Real Estate",
    sourceUrl: null,
    installSource: skillPath(`${item.slug}-tools`, "real-estate"),
    trustLevel: "markdown_only",
    tags: [...item.tags],
    installedSkillId: null,
    markdown: readSkillMarkdown(`${item.slug}-tools`, "real-estate"),
    installNotes: `Requires ${item.name} plugin credentials before live real-estate operations.`,
  })),
  ...communicationDefinitions.map<Skill>((item) => ({
    id: `communication/${item.slug}-tools`,
    slug: `${item.slug}-tools`,
    name: `${item.name} Tools`,
    description: `Use the PaperClaw ${item.name} Communication plugin through guarded agent tools.`,
    categorySlug: "communication",
    categoryName: "Communication",
    sourceUrl: null,
    installSource: skillPath(`${item.slug}-tools`, "communication"),
    trustLevel: "markdown_only",
    tags: [...item.tags],
    installedSkillId: null,
    markdown: readSkillMarkdown(`${item.slug}-tools`, "communication"),
    installNotes: `Requires ${item.name} plugin credentials before live communication operations.`,
  })),
];

const plugins: Plugin[] = [
  {
    id: "playwright-mcp",
    slug: "playwright-mcp",
    name: "Browser Automation",
    description: "Playwright MCP powered browser automation tools for agent research and web task execution.",
    categorySlug: "tools",
    categoryName: "Tools",
    categorySlugs: ["tools", "developer"],
    packageName: "@kesarcloud/plugin-playwright-mcp",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("playwright-mcp"),
    tags: ["browser", "automation", "research"],
    capabilities: ["browser.navigate", "browser.click", "browser.type", "browser.screenshot"],
    toolCount: 8,
    uiSlotCount: 1,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Browser Automation\n\nInstall the Playwright MCP plugin before installing browser or research capability packs.",
    installNotes: "After install, review browser sandbox settings before assigning to agents.",
  },
  {
    id: "google-workspace",
    slug: "google-workspace",
    name: "Google Workspace",
    description: "Google Workspace tools for Gmail, Docs, Drive, Calendar, and operational workflows.",
    categorySlug: "tools",
    categoryName: "Tools",
    packageName: "@kesarcloud/plugin-google-workspace",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("google-workspace"),
    tags: ["google", "workspace", "calendar"],
    capabilities: ["gmail", "docs", "drive", "calendar"],
    toolCount: 10,
    uiSlotCount: 1,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Google Workspace\n\nInstall and configure Workspace credentials before using the skill pack.",
    installNotes: "Use least-privilege OAuth scopes for production companies.",
  },
  {
    id: "meta-ads",
    slug: "meta-ads",
    name: "Meta Ads",
    description: "Meta Ads connector tools for campaign inspection, reporting, and guarded ad operations.",
    categorySlug: "tools",
    categoryName: "Tools",
    packageName: "@kesarcloud/plugin-meta-ads",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("meta-ads"),
    tags: ["ads", "meta", "marketing"],
    capabilities: ["campaigns", "adsets", "insights"],
    toolCount: 7,
    uiSlotCount: 1,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Meta Ads\n\nGuarded Meta Ads tooling for agent companies.",
    installNotes: "Keep spend-changing operations behind board approval policies.",
  },
  {
    id: "appointment-booking",
    slug: "appointment-booking",
    name: "Appointment Booking",
    description: "Scheduling and appointment booking connector for calendar-backed workflows.",
    categorySlug: "tools",
    categoryName: "Tools",
    packageName: "@kesarcloud/plugin-appointment-booking",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("appointment-booking"),
    tags: ["calendar", "booking", "scheduling"],
    capabilities: ["availability", "booking", "confirmation"],
    toolCount: 6,
    uiSlotCount: 1,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Appointment Booking\n\nScheduling tools with confirmation-first workflows.",
    installNotes: "Connect calendar provider credentials before enabling agents.",
  },
  {
    id: "canva",
    slug: "canva",
    name: "Canva",
    description: "Canva Connect API tools for designs, assets, exports, brand templates, folders, comments, imports, and resizes.",
    categorySlug: "tools",
    categoryName: "Tools",
    categorySlugs: ["tools", "developer"],
    packageName: "@kesarcloud/plugin-canva",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("canva"),
    tags: ["canva", "design", "creative", "assets"],
    capabilities: ["designs", "assets", "exports", "brand-templates", "folders", "comments"],
    toolCount: 35,
    uiSlotCount: 2,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Canva\n\nCanva Connect API tooling for agent companies with OAuth setup and dry-run guardrails.",
    installNotes: "Create a Canva developer integration, add the PaperClaw redirect URI, then connect OAuth from plugin settings.",
  },
  {
    id: "shopify",
    slug: "shopify",
    name: "Shopify",
    description: "Shopify Admin GraphQL connector for products, inventory, orders, pages, collections, and webhooks.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-shopify",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("shopify"),
    tags: ["shopify", "commerce", "store", "orders"],
    capabilities: ["products", "inventory", "orders", "pages", "webhooks"],
    toolCount: 14,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Shopify\n\nShopify Admin GraphQL tooling for agent companies with OAuth setup and dry-run guardrails.",
    installNotes: "Create a Shopify app, configure the OAuth callback, add the app secret, then connect each store from plugin settings.",
  },
  {
    id: "woocommerce",
    slug: "woocommerce",
    name: "WooCommerce",
    description: "WooCommerce REST API connector for products, inventory, orders, customers, and webhooks.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-woocommerce",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("woocommerce"),
    tags: ["woocommerce", "commerce", "store", "orders"],
    capabilities: ["products", "inventory", "orders", "customers", "webhooks"],
    toolCount: 11,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# WooCommerce\n\nWooCommerce REST API tooling for agent companies with dry-run guardrails.",
    installNotes: "Configure WooCommerce REST API consumer key and secret references before assigning live work.",
  },
  {
    id: "bigcommerce",
    slug: "bigcommerce",
    name: "BigCommerce",
    description: "BigCommerce Admin API connector for catalog, inventory, orders, customers, and webhooks.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-bigcommerce",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("bigcommerce"),
    tags: ["bigcommerce", "commerce", "catalog", "orders"],
    capabilities: ["products", "inventory", "orders", "customers", "webhooks"],
    toolCount: 11,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# BigCommerce\n\nBigCommerce Admin API tooling for agent companies with dry-run guardrails.",
    installNotes: "Configure store hash and access token secret reference before assigning live work.",
  },
  {
    id: "adobe-commerce",
    slug: "adobe-commerce",
    name: "Adobe Commerce",
    description: "Adobe Commerce and Magento REST API connector for catalog, inventory, orders, customers, and webhooks.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-adobe-commerce",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("adobe-commerce"),
    tags: ["adobe-commerce", "magento", "commerce", "orders"],
    capabilities: ["products", "inventory", "orders", "customers", "webhooks"],
    toolCount: 11,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Adobe Commerce\n\nAdobe Commerce and Magento REST API tooling for agent companies with dry-run guardrails.",
    installNotes: "Configure integration token secret reference and store view before assigning live work.",
  },
  {
    id: "square-commerce",
    slug: "square-commerce",
    name: "Square Commerce",
    description: "Square API connector for catalog, inventory, orders, customers, and webhook-ready commerce operations.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-square-commerce",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("square-commerce"),
    tags: ["square", "commerce", "catalog", "orders"],
    capabilities: ["products", "inventory", "orders", "customers", "webhooks"],
    toolCount: 11,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Square Commerce\n\nSquare commerce tooling for agent companies with sandbox-first setup and dry-run guardrails.",
    installNotes: "Configure a Square sandbox token secret reference before assigning live work.",
  },
  {
    id: "commercetools",
    slug: "commercetools",
    name: "commercetools",
    description: "commercetools HTTP API connector for products, inventory, orders, customers, and project operations.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-commercetools",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("commercetools"),
    tags: ["commercetools", "headless", "commerce", "orders"],
    capabilities: ["products", "inventory", "orders", "customers", "webhooks"],
    toolCount: 11,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# commercetools\n\ncommercetools HTTP API tooling for agent companies with project-scoped guardrails.",
    installNotes: "Configure project key and access token secret reference before assigning live work.",
  },
  {
    id: "wix-ecommerce",
    slug: "wix-ecommerce",
    name: "Wix eCommerce",
    description: "Wix eCommerce API connector for products, inventory, orders, customers, and storefront operations.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-wix-ecommerce",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("wix-ecommerce"),
    tags: ["wix", "ecommerce", "store", "orders"],
    capabilities: ["products", "inventory", "orders", "customers", "webhooks"],
    toolCount: 11,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Wix eCommerce\n\nWix eCommerce API tooling for agent companies with OAuth/token setup and dry-run guardrails.",
    installNotes: "Configure Wix OAuth or API access token secret reference before assigning live work.",
  },
  {
    id: "ecwid",
    slug: "ecwid",
    name: "Ecwid",
    description: "Ecwid REST API connector for products, inventory, orders, customers, and store operations.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-ecwid",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("ecwid"),
    tags: ["ecwid", "commerce", "store", "orders"],
    capabilities: ["products", "inventory", "orders", "customers", "webhooks"],
    toolCount: 11,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Ecwid\n\nEcwid REST API tooling for agent companies with dry-run guardrails.",
    installNotes: "Configure store ID and access token secret reference before assigning live work.",
  },
  {
    id: "prestashop",
    slug: "prestashop",
    name: "PrestaShop",
    description: "PrestaShop Webservice API connector for products, stock, orders, customers, and store operations.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    packageName: "@kesarcloud/plugin-prestashop",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("prestashop"),
    tags: ["prestashop", "commerce", "store", "orders"],
    capabilities: ["products", "inventory", "orders", "customers", "webhooks"],
    toolCount: 11,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# PrestaShop\n\nPrestaShop Webservice API tooling for agent companies with dry-run guardrails.",
    installNotes: "Configure PrestaShop Webservice key secret reference before assigning live work.",
  },
  {
    id: "razorpay",
    slug: "razorpay",
    name: "Razorpay",
    description: "Razorpay merchant API connector for orders, payments, refunds, payment links, customers, and webhooks.",
    categorySlug: "finance",
    categoryName: "Finance",
    packageName: "@kesarcloud/plugin-razorpay",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("razorpay"),
    tags: ["razorpay", "payments", "refunds", "orders"],
    capabilities: ["payments", "orders", "refunds", "payment-links", "customers", "webhooks"],
    toolCount: 24,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Razorpay\n\nRazorpay merchant payment tooling for agent companies with Basic Auth, webhook verification, and dry-run guardrails.",
    installNotes: "Add Razorpay API keys and webhook secret references before assigning live payment work.",
  },
  {
    id: "stripe",
    slug: "stripe",
    name: "Stripe",
    description: "Stripe Merchant Core connector for PaymentIntents, refunds, Checkout Sessions, customers, products, prices, and webhooks.",
    categorySlug: "finance",
    categoryName: "Finance",
    packageName: "@kesarcloud/plugin-stripe",
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath("stripe"),
    tags: ["stripe", "payments", "refunds", "checkout"],
    capabilities: ["payment-intents", "refunds", "checkout-sessions", "customers", "products", "prices", "webhooks"],
    toolCount: 27,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: "# Stripe\n\nStripe Merchant Core tooling for agent companies with secret-key auth, webhook verification, and dry-run guardrails.",
    installNotes: "Configure a Stripe test key first, verify webhook signature handling, then enable live mode deliberately.",
  },
  ...productivityDefinitions.map<Plugin>((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    description: item.description,
    categorySlug: "productivity",
    categoryName: "Productivity",
    ...(["jira", "linear", "confluence"].includes(item.slug) ? { categorySlugs: ["productivity", "developer"] } : {}),
    packageName: item.packageName,
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath(item.slug),
    tags: [...item.tags],
    capabilities: [...item.capabilities],
    toolCount: 9,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: `# ${item.name}\n\n${item.description} Dry-run guardrails are enabled for mutating agent work.`,
    installNotes: `Configure ${item.name} credentials in plugin settings before assigning live work.`,
  })),
  ...legalDefinitions.map<Plugin>((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    description: item.description,
    categorySlug: "legal_law",
    categoryName: "Legal & Law",
    packageName: item.packageName,
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath(item.slug),
    tags: [...item.tags],
    capabilities: [...item.capabilities],
    toolCount: 9,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: `# ${item.name}\n\n${item.description} Dry-run guardrails are enabled for mutating legal operations. These tools do not provide legal advice.`,
    installNotes: `Configure ${item.name} credentials and any required tenant/region host before assigning live legal work.`,
  })),
  ...financeDefinitions.map<Plugin>((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    description: item.description,
    categorySlug: "finance",
    categoryName: "Finance",
    packageName: item.packageName,
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath(item.slug),
    tags: [...item.tags],
    capabilities: [...item.capabilities],
    toolCount: 9,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: `# ${item.name}\n\n${item.description} Dry-run guardrails are enabled for mutating finance operations. These tools do not provide accounting, tax, investment, or legal advice.`,
    installNotes: `Configure ${item.name} credentials and any required tenant/account identifiers before assigning live finance work.`,
  })),
  ...developerDefinitions.map<Plugin>((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    description: item.description,
    categorySlug: "developer",
    categoryName: "Developer",
    packageName: item.packageName,
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath(item.slug),
    tags: [...item.tags],
    capabilities: [...item.capabilities],
    toolCount: 9,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: `# ${item.name}\n\n${item.description} Dry-run guardrails are enabled for production-impacting developer-platform operations.`,
    installNotes: `Configure ${item.name} credentials and any required org/project/tenant identifiers before assigning live developer work.`,
  })),
  ...logisticsDefinitions.map<Plugin>((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    description: item.description,
    categorySlug: "courier-logistics",
    categoryName: "Courier & Logistics",
    packageName: item.packageName,
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath(item.slug),
    tags: [...item.tags],
    capabilities: [...item.capabilities],
    toolCount: 9,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: `# ${item.name}\n\n${item.description} Dry-run guardrails are enabled for shipment creation, label purchase, and pickup operations.`,
    installNotes: `Configure ${item.name} credentials and keep dry-run enabled before assigning live logistics work.`,
  })),
  ...realEstateDefinitions.map<Plugin>((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    description: item.description,
    categorySlug: "real-estate",
    categoryName: "Real Estate",
    packageName: item.packageName,
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath(item.slug),
    tags: [...item.tags],
    capabilities: [...item.capabilities],
    toolCount: 9,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 0,
    installedPluginId: null,
    installedStatus: null,
    markdown: `# ${item.name}\n\n${item.description} Dry-run guardrails are enabled for mutating real-estate operations. Use official APIs only.`,
    installNotes: `Configure ${item.name} credentials and confirm local licensing/compliance before assigning live real-estate work.`,
  })),
  ...communicationDefinitions.map<Plugin>((item) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    description: item.description,
    categorySlug: "communication",
    categoryName: "Communication",
    packageName: item.packageName,
    version: "0.1.0",
    sourceType: "bundled",
    localPath: pluginPath(item.slug),
    tags: [...item.tags],
    capabilities: [...item.capabilities],
    toolCount: 9,
    uiSlotCount: 3,
    jobCount: 0,
    webhookCount: 1,
    installedPluginId: null,
    installedStatus: null,
    markdown: `# ${item.name}\n\n${item.description} Dry-run guardrails are enabled for sends, calls, campaigns, templates, and other communication mutations.`,
    installNotes: `Configure ${item.name} credentials and verify consent, opt-out, templates, recording disclosure, and local telecom/channel rules before live use.`,
  })),
];

function component(id: string, name: string): Component {
  return { id, name, installedId: null, status: null };
}

function itemCategorySlugs(item: { categorySlug: string; categorySlugs?: string[] }) {
  return item.categorySlugs?.length ? item.categorySlugs : [item.categorySlug];
}

const packs: Pack[] = [
  {
    id: "tools/research-capability-pack",
    slug: "research-capability-pack",
    name: "Research Capability Pack",
    description: "Browser automation plugin plus research protocol skills for repeatable market, product, and competitive research.",
    categorySlug: "tools",
    categoryName: "Tools",
    tags: ["research", "browser", "verification"],
    plugin: component("playwright-mcp", "Browser Automation"),
    skills: [
      component("tools/research-protocol-tools", "Research Protocol Tools"),
      component("tools/browser-automation-tools", "Browser Automation Tools"),
    ],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Research Capability Pack\n\nInstalls browser automation tooling and the research protocol skill set.",
    installNotes: "Install the plugin, verify browser settings, then assign skills to CEO or research agents.",
    checklist: [
      { key: "plugin-installed", label: "Browser automation plugin installed", status: "needs_action", required: true, href: "/instance/settings/plugins" },
      { key: "plugin-ready", label: "Browser automation plugin ready", status: "needs_action", required: true, href: "/instance/settings/plugins" },
      { key: "skill-research-protocol-tools", label: "Research protocol skill installed", status: "needs_action", required: true, href: "/skills" },
      { key: "skill-browser-automation-tools", label: "Browser automation skill installed", status: "needs_action", required: true, href: "/skills" },
      { key: "skill-assignment", label: "Assign skills to selected agents", status: "needs_action", required: false, href: "/agents/all" },
    ],
  },
  {
    id: "tools/google-workspace-capability-pack",
    slug: "google-workspace-capability-pack",
    name: "Google Workspace Capability Pack",
    description: "Google Workspace plugin plus operating skill for Gmail, Docs, Drive, and Calendar work.",
    categorySlug: "tools",
    categoryName: "Tools",
    tags: ["google", "workspace", "calendar"],
    plugin: component("google-workspace", "Google Workspace"),
    skills: [component("tools/google-workspace-tools", "Google Workspace Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Google Workspace Capability Pack\n\nInstalls Workspace connector and operating skill.",
    installNotes: "Configure credentials after installation.",
    checklist: [],
  },
  {
    id: "tools/meta-ads-capability-pack",
    slug: "meta-ads-capability-pack",
    name: "Meta Ads Capability Pack",
    description: "Meta Ads plugin plus guarded marketing operations skill.",
    categorySlug: "tools",
    categoryName: "Tools",
    tags: ["ads", "meta", "marketing"],
    plugin: component("meta-ads", "Meta Ads"),
    skills: [component("tools/meta-ads-tools", "Meta Ads Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Meta Ads Capability Pack\n\nInstalls Meta Ads connector and skill protocol.",
    installNotes: "Review spend controls and approval gates before production use.",
    checklist: [],
  },
  {
    id: "tools/appointment-booking-capability-pack",
    slug: "appointment-booking-capability-pack",
    name: "Appointment Booking Capability Pack",
    description: "Appointment booking plugin plus scheduling skill for calendar-backed workflows.",
    categorySlug: "tools",
    categoryName: "Tools",
    tags: ["calendar", "booking", "scheduling"],
    plugin: component("appointment-booking", "Appointment Booking"),
    skills: [component("tools/appointment-booking-tools", "Appointment Booking Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Appointment Booking Capability Pack\n\nInstalls booking connector and scheduling skill.",
    installNotes: "Connect calendar provider credentials after installation.",
    checklist: [],
  },
  {
    id: "tools/browser-automation-capability-pack",
    slug: "browser-automation-capability-pack",
    name: "Browser Automation Capability Pack",
    description: "Browser automation plugin plus practical browser-use skill instructions.",
    categorySlug: "tools",
    categoryName: "Tools",
    categorySlugs: ["tools", "developer"],
    tags: ["browser", "automation", "playwright"],
    plugin: component("playwright-mcp", "Browser Automation"),
    skills: [component("tools/browser-automation-tools", "Browser Automation Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Browser Automation Capability Pack\n\nInstalls browser automation connector and usage skill.",
    installNotes: "Verify browser sandbox and permissions before assignment.",
    checklist: [],
  },
  {
    id: "tools/canva-capability-pack",
    slug: "canva-capability-pack",
    name: "Canva Capability Pack",
    description: "Canva plugin plus creative operations skill for governed design, asset, export, and template workflows.",
    categorySlug: "tools",
    categoryName: "Tools",
    categorySlugs: ["tools", "developer"],
    tags: ["canva", "design", "creative", "assets"],
    plugin: component("canva", "Canva"),
    skills: [component("tools/canva-tools", "Canva Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Canva Capability Pack\n\nInstalls the Canva connector and creative operations skill.",
    installNotes: "Connect Canva OAuth in plugin settings before assigning live creative work.",
    checklist: [],
  },
  {
    id: "ecommerce/shopify-commerce-capability-pack",
    slug: "shopify-commerce-capability-pack",
    name: "Shopify Commerce Capability Pack",
    description: "Shopify plugin plus commerce operations skill for governed store, product, order, inventory, and webhook work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["shopify", "commerce", "store", "orders"],
    plugin: component("shopify", "Shopify"),
    skills: [component("ecommerce/shopify-tools", "Shopify Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Shopify Commerce Capability Pack\n\nInstalls the Shopify connector and commerce operations skill.",
    installNotes: "Connect Shopify OAuth in plugin settings before assigning live store work.",
    checklist: [],
  },
  {
    id: "ecommerce/woocommerce-commerce-capability-pack",
    slug: "woocommerce-commerce-capability-pack",
    name: "WooCommerce Commerce Capability Pack",
    description: "WooCommerce plugin plus commerce operations skill for governed store, product, order, inventory, and customer work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["woocommerce", "commerce", "store", "orders"],
    plugin: component("woocommerce", "WooCommerce"),
    skills: [component("ecommerce/woocommerce-tools", "WooCommerce Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# WooCommerce Commerce Capability Pack\n\nInstalls the WooCommerce connector and commerce operations skill.",
    installNotes: "Configure WooCommerce REST API credentials before assigning live store work.",
    checklist: [],
  },
  {
    id: "ecommerce/bigcommerce-commerce-capability-pack",
    slug: "bigcommerce-commerce-capability-pack",
    name: "BigCommerce Commerce Capability Pack",
    description: "BigCommerce plugin plus commerce operations skill for governed catalog, inventory, order, and customer work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["bigcommerce", "commerce", "catalog", "orders"],
    plugin: component("bigcommerce", "BigCommerce"),
    skills: [component("ecommerce/bigcommerce-tools", "BigCommerce Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# BigCommerce Commerce Capability Pack\n\nInstalls the BigCommerce connector and commerce operations skill.",
    installNotes: "Configure store hash and access token before assigning live store work.",
    checklist: [],
  },
  {
    id: "ecommerce/adobe-commerce-capability-pack",
    slug: "adobe-commerce-capability-pack",
    name: "Adobe Commerce Capability Pack",
    description: "Adobe Commerce plugin plus operations skill for governed catalog, inventory, order, and customer work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["adobe-commerce", "magento", "commerce", "orders"],
    plugin: component("adobe-commerce", "Adobe Commerce"),
    skills: [component("ecommerce/adobe-commerce-tools", "Adobe Commerce Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Adobe Commerce Capability Pack\n\nInstalls the Adobe Commerce connector and commerce operations skill.",
    installNotes: "Configure integration token and store view before assigning live store work.",
    checklist: [],
  },
  {
    id: "ecommerce/square-commerce-capability-pack",
    slug: "square-commerce-capability-pack",
    name: "Square Commerce Capability Pack",
    description: "Square Commerce plugin plus operations skill for governed catalog, inventory, order, and customer work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["square", "commerce", "catalog", "orders"],
    plugin: component("square-commerce", "Square Commerce"),
    skills: [component("ecommerce/square-commerce-tools", "Square Commerce Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Square Commerce Capability Pack\n\nInstalls the Square Commerce connector and commerce operations skill.",
    installNotes: "Configure Square sandbox credentials before assigning live commerce work.",
    checklist: [],
  },
  {
    id: "ecommerce/commercetools-commerce-capability-pack",
    slug: "commercetools-commerce-capability-pack",
    name: "commercetools Commerce Capability Pack",
    description: "commercetools plugin plus operations skill for governed headless commerce work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["commercetools", "headless", "commerce", "orders"],
    plugin: component("commercetools", "commercetools"),
    skills: [component("ecommerce/commercetools-tools", "commercetools Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# commercetools Commerce Capability Pack\n\nInstalls the commercetools connector and commerce operations skill.",
    installNotes: "Configure project key and access token before assigning live commerce work.",
    checklist: [],
  },
  {
    id: "ecommerce/wix-ecommerce-capability-pack",
    slug: "wix-ecommerce-capability-pack",
    name: "Wix eCommerce Capability Pack",
    description: "Wix eCommerce plugin plus operations skill for governed product, inventory, order, and customer work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["wix", "ecommerce", "store", "orders"],
    plugin: component("wix-ecommerce", "Wix eCommerce"),
    skills: [component("ecommerce/wix-ecommerce-tools", "Wix eCommerce Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Wix eCommerce Capability Pack\n\nInstalls the Wix eCommerce connector and commerce operations skill.",
    installNotes: "Configure Wix access token before assigning live store work.",
    checklist: [],
  },
  {
    id: "ecommerce/ecwid-commerce-capability-pack",
    slug: "ecwid-commerce-capability-pack",
    name: "Ecwid Commerce Capability Pack",
    description: "Ecwid plugin plus operations skill for governed store, product, order, inventory, and customer work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["ecwid", "commerce", "store", "orders"],
    plugin: component("ecwid", "Ecwid"),
    skills: [component("ecommerce/ecwid-tools", "Ecwid Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Ecwid Commerce Capability Pack\n\nInstalls the Ecwid connector and commerce operations skill.",
    installNotes: "Configure Ecwid store ID and access token before assigning live store work.",
    checklist: [],
  },
  {
    id: "ecommerce/prestashop-commerce-capability-pack",
    slug: "prestashop-commerce-capability-pack",
    name: "PrestaShop Commerce Capability Pack",
    description: "PrestaShop plugin plus operations skill for governed product, stock, order, and customer work.",
    categorySlug: "ecommerce",
    categoryName: "Ecommerce",
    tags: ["prestashop", "commerce", "store", "orders"],
    plugin: component("prestashop", "PrestaShop"),
    skills: [component("ecommerce/prestashop-tools", "PrestaShop Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# PrestaShop Commerce Capability Pack\n\nInstalls the PrestaShop connector and commerce operations skill.",
    installNotes: "Configure PrestaShop Webservice credentials before assigning live store work.",
    checklist: [],
  },
  {
    id: "tools/razorpay-payments-capability-pack",
    slug: "razorpay-payments-capability-pack",
    name: "Razorpay Payments Capability Pack",
    description: "Razorpay plugin plus payment operations skill for governed orders, captures, refunds, payment links, customers, and webhooks.",
    categorySlug: "finance",
    categoryName: "Finance",
    tags: ["razorpay", "payments", "refunds", "orders"],
    plugin: component("razorpay", "Razorpay"),
    skills: [component("tools/razorpay-tools", "Razorpay Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Razorpay Payments Capability Pack\n\nInstalls the Razorpay connector and payment operations skill.",
    installNotes: "Configure Razorpay test keys first, verify webhook signature handling, then enable live mode deliberately.",
    checklist: [],
  },
  {
    id: "tools/stripe-payments-capability-pack",
    slug: "stripe-payments-capability-pack",
    name: "Stripe Payments Capability Pack",
    description: "Stripe plugin plus payment operations skill for governed PaymentIntents, refunds, Checkout Sessions, customers, products, prices, and webhooks.",
    categorySlug: "finance",
    categoryName: "Finance",
    tags: ["stripe", "payments", "refunds", "checkout"],
    plugin: component("stripe", "Stripe"),
    skills: [component("tools/stripe-tools", "Stripe Tools")],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Stripe Payments Capability Pack\n\nInstalls the Stripe connector and payment operations skill.",
    installNotes: "Configure Stripe test keys first, verify webhook signature handling, then enable live mode deliberately.",
    checklist: [],
  },
  ...productivityDefinitions.map<Pack>((item) => ({
    id: `productivity/${item.slug}-capability-pack`,
    slug: `${item.slug}-capability-pack`,
    name: `${item.name} Capability Pack`,
    description: `${item.name} plugin plus productivity operating skill for governed agent workflows.`,
    categorySlug: "productivity",
    categoryName: "Productivity",
    ...(["jira", "linear", "confluence"].includes(item.slug) ? { categorySlugs: ["productivity", "developer"] } : {}),
    tags: [...item.tags],
    plugin: component(item.slug, item.name),
    skills: [component(`productivity/${item.slug}-tools`, `${item.name} Tools`)],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: `# ${item.name} Capability Pack\n\nInstalls the ${item.name} connector and productivity operating skill.`,
    installNotes: `Configure ${item.name} credentials after installation.`,
    checklist: [],
  })),
  ...legalDefinitions.map<Pack>((item) => ({
    id: `legal_law/${item.slug}-capability-pack`,
    slug: `${item.slug}-capability-pack`,
    name: `${item.name} Capability Pack`,
    description: `${item.name} plugin plus Legal & Law operating skill for governed agent workflows.`,
    categorySlug: "legal_law",
    categoryName: "Legal & Law",
    tags: [...item.tags],
    plugin: component(item.slug, item.name),
    skills: [component(`legal_law/${item.slug}-tools`, `${item.name} Tools`)],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: `# ${item.name} Capability Pack\n\nInstalls the ${item.name} connector and Legal & Law operating skill.`,
    installNotes: `Configure ${item.name} credentials after installation. Keep dry-run enabled until board approval for live mutations.`,
    checklist: [],
  })),
  ...financeDefinitions.map<Pack>((item) => ({
    id: `finance/${item.slug}-capability-pack`,
    slug: `${item.slug}-capability-pack`,
    name: `${item.name} Capability Pack`,
    description: `${item.name} plugin plus Finance operating skill for governed agent workflows.`,
    categorySlug: "finance",
    categoryName: "Finance",
    tags: [...item.tags],
    plugin: component(item.slug, item.name),
    skills: [component(`finance/${item.slug}-tools`, `${item.name} Tools`)],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: `# ${item.name} Capability Pack\n\nInstalls the ${item.name} connector and Finance operating skill.`,
    installNotes: `Configure ${item.name} credentials after installation. Keep dry-run enabled until board approval for live finance mutations.`,
    checklist: [],
  })),
  {
    id: "developer/developer-suite-capability-pack",
    slug: "developer-suite-capability-pack",
    name: "Developer Suite Capability Pack",
    description: "Broad developer platform plugin suite for design, code hosting, deploy, backend, API tooling, observability, testing, and security workflows.",
    categorySlug: "developer",
    categoryName: "Developer",
    tags: ["developer", "design", "devops", "backend", "observability"],
    plugin: null,
    skills: developerDefinitions.map((item) => component(`developer/${item.slug}-tools`, `${item.name} Tools`)),
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: "# Developer Suite Capability Pack\n\nInstalls the developer-platform operating skills for the bundled Developer plugin suite.",
    installNotes: "Install the required Developer plugins, configure credentials, keep dry-run enabled, then assign skills to engineering agents.",
    checklist: [],
  },
  ...developerDefinitions.map<Pack>((item) => ({
    id: `developer/${item.slug}-capability-pack`,
    slug: `${item.slug}-capability-pack`,
    name: `${item.name} Capability Pack`,
    description: `${item.name} plugin plus Developer operating skill for governed agent workflows.`,
    categorySlug: "developer",
    categoryName: "Developer",
    tags: [...item.tags],
    plugin: component(item.slug, item.name),
    skills: [component(`developer/${item.slug}-tools`, `${item.name} Tools`)],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: `# ${item.name} Capability Pack\n\nInstalls the ${item.name} connector and Developer operating skill.`,
    installNotes: `Configure ${item.name} credentials after installation. Keep dry-run enabled until board approval for live developer-platform mutations.`,
    checklist: [],
  })),
  ...logisticsDefinitions.map<Pack>((item) => ({
    id: `courier-logistics/${item.slug}-capability-pack`,
    slug: `${item.slug}-capability-pack`,
    name: `${item.name} Capability Pack`,
    description: `${item.name} plugin plus Courier & Logistics operating skill for governed shipping workflows.`,
    categorySlug: "courier-logistics",
    categoryName: "Courier & Logistics",
    tags: [...item.tags],
    plugin: component(item.slug, item.name),
    skills: [component(`courier-logistics/${item.slug}-tools`, `${item.name} Tools`)],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: `# ${item.name} Capability Pack\n\nInstalls the ${item.name} connector and Courier & Logistics operating skill.`,
    installNotes: `Configure ${item.name} credentials after installation. Keep dry-run enabled until board approval for live labels or pickups.`,
    checklist: [],
  })),
  ...realEstateDefinitions.map<Pack>((item) => ({
    id: `real-estate/${item.slug}-capability-pack`,
    slug: `${item.slug}-capability-pack`,
    name: `${item.name} Capability Pack`,
    description: `${item.name} plugin plus Real Estate operating skill for governed property workflows.`,
    categorySlug: "real-estate",
    categoryName: "Real Estate",
    tags: [...item.tags],
    plugin: component(item.slug, item.name),
    skills: [component(`real-estate/${item.slug}-tools`, `${item.name} Tools`)],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: `# ${item.name} Capability Pack\n\nInstalls the ${item.name} connector and Real Estate operating skill.`,
    installNotes: `Configure ${item.name} credentials after installation. Keep dry-run enabled until board approval for live real-estate mutations.`,
    checklist: [],
  })),
  ...communicationDefinitions.map<Pack>((item) => ({
    id: `communication/${item.slug}-capability-pack`,
    slug: `${item.slug}-capability-pack`,
    name: `${item.name} Capability Pack`,
    description: `${item.name} plugin plus Communication operating skill for governed messaging and voice workflows.`,
    categorySlug: "communication",
    categoryName: "Communication",
    tags: [...item.tags],
    plugin: component(item.slug, item.name),
    skills: [component(`communication/${item.slug}-tools`, `${item.name} Tools`)],
    defaultAssignMode: "ceo",
    installed: false,
    needsSetup: true,
    markdown: `# ${item.name} Capability Pack\n\nInstalls the ${item.name} connector and Communication operating skill.`,
    installNotes: `Configure ${item.name} credentials after installation. Keep dry-run enabled until board approval for live sends, calls, templates, or campaign mutations.`,
    checklist: [],
  })),
];

function page<T extends { name: string; description: string | null; categorySlug: string; categorySlugs?: string[]; slug: string; tags: string[] }>(items: T[], url: URL) {
  const category = normalizeCategorySlug(url.searchParams.get("category"));
  const query = url.searchParams.get("q")?.toLowerCase().trim();
  const limit = Math.max(1, Math.min(200, Number.parseInt(url.searchParams.get("limit") ?? "60", 10) || 60));
  const offset = Math.max(0, Number.parseInt(url.searchParams.get("cursor") ?? "0", 10) || 0);
  const filtered = items.filter((item) => {
    if (category && !itemCategorySlugs(item).includes(category)) return false;
    if (!query) return true;
    return [item.name, item.description, item.slug, ...item.tags]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query));
  });
  const pageItems = filtered.slice(offset, offset + limit);
  const nextOffset = offset + pageItems.length;
  return {
    items: pageItems,
    nextCursor: nextOffset < filtered.length ? String(nextOffset) : null,
  };
}

function listItem<T extends Skill | Plugin | Pack>(item: T) {
  if ("markdown" in item) {
    const { markdown, installNotes, checklist, ...rest } = item as Pack;
    if ("plugin" in rest) return rest;
    const skillOrPlugin = item as Skill | Plugin;
    const { markdown: _markdown, installNotes: _installNotes, ...listRest } = skillOrPlugin;
    return listRest;
  }
  return item;
}

function categoryList<T extends { categorySlug: string; categoryName: string; categorySlugs?: string[] }>(items: T[], countKey: string) {
  const categories = new Map<string, { id: string; slug: string; name: string; count: number }>();
  for (const item of items) {
    for (const slug of itemCategorySlugs(item)) {
      const existing = categories.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        categories.set(slug, {
          id: slug,
          slug,
          name: categoryNames[slug] ?? (slug === item.categorySlug ? item.categoryName : slug),
          count: 1,
        });
      }
    }
  }
  return [...categories.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ count, ...category }) => ({ ...category, [countKey]: count }));
}

function json(response: http.ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);

  if (request.method === "OPTIONS") return json(response, 204, {});
  if (request.method !== "GET") return json(response, 405, { error: "Method not allowed" });
  if (url.pathname === "/health") return json(response, 200, { ok: true });

  if (url.pathname === "/skills/categories") return json(response, 200, categoryList(skills, "skillCount"));
  if (url.pathname === "/plugins/categories") return json(response, 200, categoryList(plugins, "pluginCount"));
  if (url.pathname === "/packs/categories") return json(response, 200, categoryList(packs, "packCount"));

  if (parts[0] === "skills" && parts.length === 1) {
    return json(response, 200, {
      ...page(skills, url),
      items: page(skills, url).items.map(listItem),
    });
  }
  if (parts[0] === "plugins" && parts.length === 1) {
    return json(response, 200, {
      ...page(plugins, url),
      items: page(plugins, url).items.map(listItem),
    });
  }
  if (parts[0] === "packs" && parts.length === 1) {
    return json(response, 200, {
      ...page(packs, url),
      items: page(packs, url).items.map(listItem),
    });
  }

  if (parts[0] === "skills" && parts.length >= 2) {
    const id = parts.slice(1).join("/");
    const skill = skills.find((item) => item.id === id || item.slug === id);
    return skill ? json(response, 200, skill) : json(response, 404, { error: "Skill not found" });
  }
  if (parts[0] === "plugins" && parts.length >= 2) {
    const id = parts.slice(1).join("/");
    const plugin = plugins.find((item) => item.id === id || item.slug === id || item.packageName === id);
    return plugin ? json(response, 200, plugin) : json(response, 404, { error: "Plugin not found" });
  }
  if (parts[0] === "packs" && parts.length >= 2) {
    const id = parts.slice(1).join("/");
    const pack = packs.find((item) => item.id === id || item.slug === id);
    return pack ? json(response, 200, pack) : json(response, 404, { error: "Pack not found" });
  }

  return json(response, 404, { error: "Not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Private marketplace API listening on http://127.0.0.1:${port}`);
});
