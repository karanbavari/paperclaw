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
  "courier-logistics": "Courier & Logistics",
  ecommerce: "Ecommerce",
  "legal-law": "Legal & Law",
  legal_law: "Legal & Law",
  productivity: "Productivity",
};

const categoryAliases: Record<string, string> = {
  "legal-law": "legal_law",
  legal: "legal_law",
  "legal-and-law": "legal_law",
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
    categorySlug: "tools",
    categoryName: "Tools",
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
    categorySlug: "tools",
    categoryName: "Tools",
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
];

const plugins: Plugin[] = [
  {
    id: "playwright-mcp",
    slug: "playwright-mcp",
    name: "Browser Automation",
    description: "Playwright MCP powered browser automation tools for agent research and web task execution.",
    categorySlug: "tools",
    categoryName: "Tools",
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
    categorySlug: "tools",
    categoryName: "Tools",
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
    categorySlug: "tools",
    categoryName: "Tools",
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
];

function component(id: string, name: string): Component {
  return { id, name, installedId: null, status: null };
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
    categorySlug: "tools",
    categoryName: "Tools",
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
    categorySlug: "tools",
    categoryName: "Tools",
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
];

function page<T extends { name: string; description: string | null; categorySlug: string; slug: string; tags: string[] }>(items: T[], url: URL) {
  const category = normalizeCategorySlug(url.searchParams.get("category"));
  const query = url.searchParams.get("q")?.toLowerCase().trim();
  const limit = Math.max(1, Math.min(200, Number.parseInt(url.searchParams.get("limit") ?? "60", 10) || 60));
  const offset = Math.max(0, Number.parseInt(url.searchParams.get("cursor") ?? "0", 10) || 0);
  const filtered = items.filter((item) => {
    if (category && item.categorySlug !== category) return false;
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

function categoryList<T extends { categorySlug: string; categoryName: string }>(items: T[], countKey: string) {
  const categories = new Map<string, { id: string; slug: string; name: string; count: number }>();
  for (const item of items) {
    const existing = categories.get(item.categorySlug);
    if (existing) {
      existing.count += 1;
    } else {
      categories.set(item.categorySlug, {
        id: item.categorySlug,
        slug: item.categorySlug,
        name: categoryNames[item.categorySlug] ?? item.categoryName,
        count: 1,
      });
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
