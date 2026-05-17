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
    slug: "clio",
    displayName: "Clio",
    description: "Connects PaperClaw agents to Clio Manage for contacts, matters, activities, tasks, documents, bills, and users.",
    apiBaseUrl: "https://app.clio.com/api/v4",
    authUrl: "https://app.clio.com/oauth/authorize",
    tokenUrl: "https://app.clio.com/oauth/token",
    tokenLabel: "Clio Access Token",
    oauthLabel: "Clio OAuth",
    connectedLabel: "Connected Clio Account",
    defaultScopes: ["read", "write"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["contactsList", "List Clio Contacts", "List contacts.", "GET", "/contacts", false, [], ["limit", "page", "query"]],
      ["contactGet", "Get Clio Contact", "Get a contact.", "GET", "/contacts/{contactId}", false, ["contactId"]],
      ["contactCreate", "Create Clio Contact", "Create a contact.", "POST", "/contacts", true, [], [], "contact"],
      ["mattersList", "List Clio Matters", "List matters.", "GET", "/matters", false, [], ["limit", "page", "query", "status"]],
      ["matterGet", "Get Clio Matter", "Get a matter.", "GET", "/matters/{matterId}", false, ["matterId"]],
      ["matterCreate", "Create Clio Matter", "Create a matter.", "POST", "/matters", true, [], [], "matter"],
      ["tasksList", "List Clio Tasks", "List tasks.", "GET", "/tasks", false, [], ["limit", "page", "matter_id", "assignee_id"]],
      ["taskCreate", "Create Clio Task", "Create a task.", "POST", "/tasks", true, [], [], "task"],
      ["documentsList", "List Clio Documents", "List documents.", "GET", "/documents", false, [], ["limit", "page", "matter_id"]],
      ["activitiesList", "List Clio Activities", "List activities/time entries.", "GET", "/activities", false, [], ["limit", "page", "matter_id"]],
      ["activityCreate", "Create Clio Activity", "Create an activity/time entry.", "POST", "/activities", true, [], [], "activity"],
      ["billsList", "List Clio Bills", "List bills.", "GET", "/bills", false, [], ["limit", "page", "matter_id"]],
    ],
  },
  {
    slug: "filevine",
    displayName: "Filevine",
    description: "Connects PaperClaw agents to Filevine for projects, contacts, tasks, notes, documents, collections, and search workflows.",
    apiBaseUrl: "https://api.filevine.io/v2",
    tokenUrl: "https://auth.filevine.io/connect/token",
    tokenLabel: "Filevine API Access Token",
    oauthLabel: "Filevine OAuth",
    connectedLabel: "Connected Org/Project",
    defaultScopes: ["fv.api"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["projectsList", "List Filevine Projects", "List projects.", "GET", "/core/projects", false, [], ["limit", "offset", "searchTerm"]],
      ["projectGet", "Get Filevine Project", "Get a project.", "GET", "/core/projects/{projectId}", false, ["projectId"]],
      ["projectCreate", "Create Filevine Project", "Create a project.", "POST", "/core/projects", true, [], [], "project"],
      ["contactsList", "List Filevine Contacts", "List contacts.", "GET", "/core/contacts", false, [], ["limit", "offset", "searchTerm"]],
      ["contactCreate", "Create Filevine Contact", "Create a contact.", "POST", "/core/contacts", true, [], [], "contact"],
      ["tasksList", "List Filevine Tasks", "List project tasks.", "GET", "/core/projects/{projectId}/tasks", false, ["projectId"], ["limit", "offset"]],
      ["taskCreate", "Create Filevine Task", "Create a task.", "POST", "/core/projects/{projectId}/tasks", true, ["projectId"], [], "task"],
      ["notesList", "List Filevine Notes", "List project notes.", "GET", "/core/projects/{projectId}/notes", false, ["projectId"], ["limit", "offset"]],
      ["noteCreate", "Create Filevine Note", "Create a note.", "POST", "/core/projects/{projectId}/notes", true, ["projectId"], [], "note"],
      ["documentsList", "List Filevine Documents", "List project documents.", "GET", "/core/projects/{projectId}/documents", false, ["projectId"], ["limit", "offset"]],
      ["collectionsList", "List Filevine Collections", "List project collections/fields.", "GET", "/core/projects/{projectId}/collections", false, ["projectId"]],
    ],
  },
  {
    slug: "docusign",
    displayName: "DocuSign",
    description: "Connects PaperClaw agents to DocuSign eSignature for envelopes, templates, recipients, documents, status, and tabs.",
    apiBaseUrl: "https://demo.docusign.net/restapi/v2.1",
    authUrl: "https://account-d.docusign.com/oauth/auth",
    tokenUrl: "https://account-d.docusign.com/oauth/token",
    tokenAuthStyle: "basic",
    tokenLabel: "DocuSign Access Token",
    oauthLabel: "DocuSign OAuth",
    connectedLabel: "Account ID",
    apiBaseUrlLabel: "DocuSign REST API Base URL",
    defaultScopes: ["signature", "impersonation"],
    rawPathPrefixes: ["/accounts/"],
    endpoints: [
      ["envelopesList", "List DocuSign Envelopes", "List envelopes.", "GET", "/accounts/{accountId}/envelopes", false, ["accountId"], ["from_date", "status", "count", "start_position"]],
      ["envelopeGet", "Get DocuSign Envelope", "Get envelope details.", "GET", "/accounts/{accountId}/envelopes/{envelopeId}", false, ["accountId", "envelopeId"]],
      ["envelopeCreate", "Create DocuSign Envelope", "Create or send an envelope.", "POST", "/accounts/{accountId}/envelopes", true, ["accountId"], [], "envelope"],
      ["templatesList", "List DocuSign Templates", "List templates.", "GET", "/accounts/{accountId}/templates", false, ["accountId"], ["count", "start_position", "search_text"]],
      ["templateGet", "Get DocuSign Template", "Get a template.", "GET", "/accounts/{accountId}/templates/{templateId}", false, ["accountId", "templateId"]],
      ["recipientsList", "List DocuSign Recipients", "List envelope recipients.", "GET", "/accounts/{accountId}/envelopes/{envelopeId}/recipients", false, ["accountId", "envelopeId"]],
      ["documentsList", "List DocuSign Documents", "List envelope documents.", "GET", "/accounts/{accountId}/envelopes/{envelopeId}/documents", false, ["accountId", "envelopeId"]],
      ["tabsList", "List DocuSign Tabs", "List recipient tabs.", "GET", "/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientId}/tabs", false, ["accountId", "envelopeId", "recipientId"]],
      ["reminderSend", "Send DocuSign Reminder", "Send an envelope reminder.", "PUT", "/accounts/{accountId}/envelopes/{envelopeId}", true, ["accountId", "envelopeId"], [], "envelope"],
    ],
  },
  {
    slug: "adobe-sign",
    displayName: "Adobe Sign",
    description: "Connects PaperClaw agents to Adobe Acrobat Sign for agreements, transient documents, templates, users, and reminders.",
    apiBaseUrl: "https://api.na1.adobesign.com/api/rest/v6",
    authUrl: "https://secure.na1.adobesign.com/public/oauth/v2",
    tokenUrl: "https://api.na1.adobesign.com/oauth/v2/token",
    tokenLabel: "Adobe Sign Access Token",
    oauthLabel: "Adobe Sign OAuth",
    connectedLabel: "Connected Adobe Sign Account",
    apiBaseUrlLabel: "Adobe Sign Regional API Base URL",
    defaultScopes: ["agreement_read", "agreement_write", "user_read", "library_read"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["agreementsList", "List Adobe Sign Agreements", "List agreements.", "GET", "/agreements", false, [], ["pageSize", "pageCursor", "query"]],
      ["agreementGet", "Get Adobe Sign Agreement", "Get agreement details.", "GET", "/agreements/{agreementId}", false, ["agreementId"]],
      ["agreementCreate", "Create Adobe Sign Agreement", "Create an agreement.", "POST", "/agreements", true, [], [], "agreement"],
      ["transientDocumentCreate", "Create Adobe Sign Transient Document", "Upload a transient document metadata request.", "POST", "/transientDocuments", true, [], [], "document"],
      ["libraryDocumentsList", "List Adobe Sign Library Documents", "List reusable library documents.", "GET", "/libraryDocuments", false, [], ["pageSize", "pageCursor"]],
      ["usersList", "List Adobe Sign Users", "List users.", "GET", "/users", false, [], ["pageSize", "pageCursor"]],
      ["meGet", "Get Adobe Sign Current User", "Get current user.", "GET", "/users/me", false],
      ["reminderCreate", "Create Adobe Sign Reminder", "Create an agreement reminder.", "POST", "/agreements/{agreementId}/reminders", true, ["agreementId"], [], "reminder"],
    ],
  },
  {
    slug: "pandadoc",
    displayName: "PandaDoc",
    description: "Connects PaperClaw agents to PandaDoc for documents, templates, contacts, recipients, folders, sends, and status tracking.",
    apiBaseUrl: "https://api.pandadoc.com/public/v1",
    authUrl: "https://app.pandadoc.com/oauth2/authorize",
    tokenUrl: "https://api.pandadoc.com/oauth2/access_token",
    tokenLabel: "PandaDoc API Key",
    oauthLabel: "PandaDoc OAuth",
    connectedLabel: "Connected Workspace",
    defaultScopes: ["read+write"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["documentsList", "List PandaDoc Documents", "List documents.", "GET", "/documents", false, [], ["count", "page", "status", "q"]],
      ["documentGet", "Get PandaDoc Document", "Get a document.", "GET", "/documents/{documentId}", false, ["documentId"]],
      ["documentCreate", "Create PandaDoc Document", "Create a document.", "POST", "/documents", true, [], [], "document"],
      ["documentSend", "Send PandaDoc Document", "Send a document.", "POST", "/documents/{documentId}/send", true, ["documentId"], [], "send"],
      ["templatesList", "List PandaDoc Templates", "List templates.", "GET", "/templates", false, [], ["count", "page", "q"]],
      ["contactsList", "List PandaDoc Contacts", "List contacts.", "GET", "/contacts", false, [], ["count", "page", "email"]],
      ["contactCreate", "Create PandaDoc Contact", "Create a contact.", "POST", "/contacts", true, [], [], "contact"],
      ["foldersList", "List PandaDoc Folders", "List folders.", "GET", "/folders", false, [], ["count", "page"]],
    ],
  },
  {
    slug: "netdocuments",
    displayName: "NetDocuments",
    description: "Connects PaperClaw agents to NetDocuments for cabinets, workspaces, folders, documents, metadata profiles, and search.",
    apiBaseUrl: "https://api.vault.netvoyage.com/v1",
    authUrl: "https://api.vault.netvoyage.com/oauth/authorize",
    tokenUrl: "https://api.vault.netvoyage.com/oauth/token",
    tokenLabel: "NetDocuments Access Token",
    oauthLabel: "NetDocuments OAuth",
    connectedLabel: "Repository/Cabinet",
    apiBaseUrlLabel: "NetDocuments API Base URL",
    defaultScopes: ["full"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["cabinetsList", "List NetDocuments Cabinets", "List cabinets.", "GET", "/cabinets", false],
      ["workspacesList", "List NetDocuments Workspaces", "List workspaces.", "GET", "/workspaces", false, [], ["q", "limit", "offset"]],
      ["workspaceGet", "Get NetDocuments Workspace", "Get workspace details.", "GET", "/workspaces/{workspaceId}", false, ["workspaceId"]],
      ["foldersList", "List NetDocuments Folder Contents", "List folder contents.", "GET", "/folders/{folderId}/contents", false, ["folderId"], ["limit", "offset"]],
      ["documentGet", "Get NetDocuments Document", "Get document metadata.", "GET", "/documents/{documentId}", false, ["documentId"]],
      ["documentCreate", "Create NetDocuments Document", "Create document metadata/upload request.", "POST", "/documents", true, [], [], "document"],
      ["profileUpdate", "Update NetDocuments Profile", "Update document profile metadata.", "PATCH", "/documents/{documentId}/profile", true, ["documentId"], [], "profile"],
      ["search", "Search NetDocuments", "Search documents and workspaces.", "POST", "/search", false, [], [], "body"],
    ],
  },
  {
    slug: "imanage",
    displayName: "iManage",
    description: "Connects PaperClaw agents to iManage Work for libraries, workspaces, folders, documents, users, and profile metadata.",
    apiBaseUrl: "https://example.imanage.work/api/v2",
    authUrl: "https://example.imanage.work/auth/oauth2/authorize",
    tokenUrl: "https://example.imanage.work/auth/oauth2/token",
    tokenLabel: "iManage Access Token",
    oauthLabel: "iManage OAuth",
    connectedLabel: "Customer/Library",
    apiBaseUrlLabel: "iManage Work API Base URL",
    defaultScopes: ["user", "work"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["librariesList", "List iManage Libraries", "List customer libraries.", "GET", "/customers/{customerId}/libraries", false, ["customerId"]],
      ["workspacesList", "List iManage Workspaces", "List workspaces.", "GET", "/customers/{customerId}/libraries/{libraryId}/workspaces", false, ["customerId", "libraryId"], ["q", "limit", "offset"]],
      ["workspaceGet", "Get iManage Workspace", "Get a workspace.", "GET", "/customers/{customerId}/libraries/{libraryId}/workspaces/{workspaceId}", false, ["customerId", "libraryId", "workspaceId"]],
      ["foldersList", "List iManage Folders", "List folders.", "GET", "/customers/{customerId}/libraries/{libraryId}/workspaces/{workspaceId}/folders", false, ["customerId", "libraryId", "workspaceId"]],
      ["documentsList", "List iManage Documents", "List documents.", "GET", "/customers/{customerId}/libraries/{libraryId}/folders/{folderId}/documents", false, ["customerId", "libraryId", "folderId"], ["limit", "offset"]],
      ["documentGet", "Get iManage Document", "Get document metadata.", "GET", "/customers/{customerId}/libraries/{libraryId}/documents/{documentId}", false, ["customerId", "libraryId", "documentId"]],
      ["documentCreate", "Create iManage Document", "Create document metadata/upload request.", "POST", "/customers/{customerId}/libraries/{libraryId}/documents", true, ["customerId", "libraryId"], [], "document"],
      ["search", "Search iManage", "Search workspaces and documents.", "POST", "/customers/{customerId}/libraries/{libraryId}/search", false, ["customerId", "libraryId"], [], "body"],
    ],
  },
  {
    slug: "relativity",
    displayName: "Relativity",
    description: "Connects PaperClaw agents to Relativity for workspaces, matters/cases, documents, saved searches, and job/export status.",
    apiBaseUrl: "https://your-relativity.example.com/Relativity.REST/api",
    tokenLabel: "Relativity Access Token",
    oauthLabel: "Relativity OAuth",
    connectedLabel: "Relativity Instance/Workspace",
    apiBaseUrlLabel: "Relativity REST API Base URL",
    defaultScopes: ["SystemUserInfo", "Workspace"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["workspacesList", "List Relativity Workspaces", "List workspaces.", "GET", "/Relativity.Services.Workspace.IWorkspaceModule/Workspace%20Manager/GetWorkspacesAsync", false],
      ["workspaceObjectsQuery", "Query Relativity Objects", "Query workspace objects.", "POST", "/Relativity.Objects/workspace/{workspaceId}/object/query", false, ["workspaceId"], [], "query"],
      ["documentGet", "Get Relativity Document", "Get document object details.", "GET", "/Relativity.Objects/workspace/{workspaceId}/object/{documentArtifactId}", false, ["workspaceId", "documentArtifactId"]],
      ["documentUpdate", "Update Relativity Document", "Update document fields.", "POST", "/Relativity.Objects/workspace/{workspaceId}/object/update", true, ["workspaceId"], [], "document"],
      ["savedSearchesQuery", "Query Relativity Saved Searches", "Query saved searches.", "POST", "/Relativity.Objects/workspace/{workspaceId}/object/query", false, ["workspaceId"], [], "query"],
      ["jobsList", "List Relativity Jobs", "List import/export job status.", "GET", "/Relativity.Services.Job.IJobModule/workspace/{workspaceId}/jobs", false, ["workspaceId"]],
    ],
  },
  {
    slug: "everlaw",
    displayName: "Everlaw",
    description: "Connects PaperClaw agents to Everlaw for organizations, projects, documents, binders, productions, searches, and users.",
    apiBaseUrl: "https://api.everlaw.com",
    tokenLabel: "Everlaw Organization API Key",
    oauthLabel: "Everlaw OAuth",
    connectedLabel: "Organization ID",
    apiBaseUrlLabel: "Everlaw Regional API Base URL",
    defaultScopes: ["organization"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["projectsList", "List Everlaw Projects", "List organization projects.", "GET", "/organizations/{organizationId}/projects", false, ["organizationId"]],
      ["projectGet", "Get Everlaw Project", "Get a project.", "GET", "/projects/{projectId}", false, ["projectId"]],
      ["documentsList", "List Everlaw Documents", "List project documents.", "GET", "/projects/{projectId}/documents", false, ["projectId"], ["limit", "offset", "query"]],
      ["documentGet", "Get Everlaw Document", "Get document metadata.", "GET", "/projects/{projectId}/documents/{documentId}", false, ["projectId", "documentId"]],
      ["bindersList", "List Everlaw Binders", "List binders.", "GET", "/projects/{projectId}/binders", false, ["projectId"]],
      ["binderCreate", "Create Everlaw Binder", "Create a binder.", "POST", "/projects/{projectId}/binders", true, ["projectId"], [], "binder"],
      ["productionsList", "List Everlaw Productions", "List productions.", "GET", "/projects/{projectId}/productions", false, ["projectId"]],
      ["searchesList", "List Everlaw Searches", "List saved searches.", "GET", "/projects/{projectId}/searches", false, ["projectId"]],
      ["usersList", "List Everlaw Users", "List project users.", "GET", "/projects/{projectId}/users", false, ["projectId"]],
    ],
  },
  {
    slug: "disco",
    displayName: "DISCO",
    description: "Connects PaperClaw agents to DISCO Ediscovery's organization API for datasets, metrics, metadata, and operational reporting.",
    apiBaseUrl: "https://api.csdisco.com",
    tokenLabel: "DISCO API Key",
    oauthLabel: "DISCO OAuth",
    connectedLabel: "Organization ID",
    authScheme: "api-key",
    accessTokenHeaderName: "disco-api-key",
    connectedAccountHeaderName: "organization-id",
    defaultScopes: ["read"],
    rawPathPrefixes: ["/datasets", "/metrics", "/metadata"],
    endpoints: [
      ["datasetsList", "List DISCO Datasets", "List available datasets.", "POST", "/datasets", false],
      ["datasetMetadata", "Get DISCO Dataset Metadata", "Get dataset metadata.", "GET", "/datasets/{datasetName}/metadata", false, ["datasetName"]],
      ["datasetQuery", "Query DISCO Dataset", "Query a dataset.", "POST", "/datasets/{datasetName}", false, ["datasetName"], [], "body"],
      ["metricsList", "List DISCO Metrics", "List available metrics.", "POST", "/metrics", false],
      ["metricQuery", "Query DISCO Metric", "Query a metric.", "POST", "/metrics/{metricName}", false, ["metricName"], [], "body"],
      ["metadataList", "List DISCO Metadata", "List API metadata.", "POST", "/metadata", false],
    ],
  },
  {
    slug: "legal-tracker",
    displayName: "Legal Tracker",
    description: "Connects PaperClaw agents to Thomson Reuters Legal Tracker for matters, invoices, firms, budgets, accruals, documents, and users.",
    apiBaseUrl: "https://api.legaltracker.thomsonreuters.com",
    tokenLabel: "Legal Tracker Access Token",
    oauthLabel: "Legal Tracker OAuth",
    connectedLabel: "Company/Tenant ID",
    apiBaseUrlLabel: "Legal Tracker Regional API Base URL",
    defaultScopes: ["matters", "invoices", "documents"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["mattersList", "List Legal Tracker Matters", "List matters.", "GET", "/matters", false, [], ["limit", "offset", "status", "query"]],
      ["matterGet", "Get Legal Tracker Matter", "Get a matter.", "GET", "/matters/{matterId}", false, ["matterId"]],
      ["matterCreate", "Create Legal Tracker Matter", "Create a matter.", "POST", "/matters", true, [], [], "matter"],
      ["invoicesList", "List Legal Tracker Invoices", "List invoices.", "GET", "/invoices", false, [], ["limit", "offset", "status", "matterId"]],
      ["invoiceGet", "Get Legal Tracker Invoice", "Get an invoice.", "GET", "/invoices/{invoiceId}", false, ["invoiceId"]],
      ["firmsList", "List Legal Tracker Firms", "List vendors/firms.", "GET", "/firms", false, [], ["limit", "offset", "query"]],
      ["budgetsList", "List Legal Tracker Budgets", "List budgets.", "GET", "/budgets", false, [], ["matterId"]],
      ["accrualsList", "List Legal Tracker Accruals", "List accruals.", "GET", "/accruals", false, [], ["matterId", "period"]],
      ["documentsList", "List Legal Tracker Documents", "List documents.", "GET", "/documents", false, [], ["matterId", "limit", "offset"]],
      ["documentCreate", "Create Legal Tracker Document", "Create document metadata/upload association.", "POST", "/documents", true, [], [], "document"],
    ],
  },
  {
    slug: "lawmatics",
    displayName: "Lawmatics",
    description: "Connects PaperClaw agents to Lawmatics for contacts, matters/cases, automations, forms, events, tasks, and notes.",
    apiBaseUrl: "https://api.lawmatics.com/v1",
    tokenLabel: "Lawmatics API Key",
    oauthLabel: "Lawmatics OAuth",
    connectedLabel: "Connected Lawmatics Account",
    defaultScopes: ["read", "write"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["contactsList", "List Lawmatics Contacts", "List contacts.", "GET", "/contacts", false, [], ["limit", "page", "query"]],
      ["contactGet", "Get Lawmatics Contact", "Get a contact.", "GET", "/contacts/{contactId}", false, ["contactId"]],
      ["contactCreate", "Create Lawmatics Contact", "Create a contact.", "POST", "/contacts", true, [], [], "contact"],
      ["mattersList", "List Lawmatics Matters", "List matters/cases.", "GET", "/matters", false, [], ["limit", "page", "status", "query"]],
      ["matterCreate", "Create Lawmatics Matter", "Create a matter/case.", "POST", "/matters", true, [], [], "matter"],
      ["tasksList", "List Lawmatics Tasks", "List tasks.", "GET", "/tasks", false, [], ["limit", "page", "contact_id", "matter_id"]],
      ["taskCreate", "Create Lawmatics Task", "Create a task.", "POST", "/tasks", true, [], [], "task"],
      ["notesList", "List Lawmatics Notes", "List notes.", "GET", "/notes", false, [], ["contact_id", "matter_id"]],
      ["noteCreate", "Create Lawmatics Note", "Create a note.", "POST", "/notes", true, [], [], "note"],
      ["formsList", "List Lawmatics Forms", "List forms.", "GET", "/forms", false],
      ["eventsList", "List Lawmatics Events", "List events.", "GET", "/events", false, [], ["start_date", "end_date"]],
      ["automationsList", "List Lawmatics Automations", "List automations.", "GET", "/automations", false],
    ],
  },
];

function endpointObject(endpoint) {
  const [key, displayName, description, method, apiPath, mutating, required = [], queryParams = [], bodyParam] = endpoint;
  return { key, displayName, description, method, path: apiPath, mutating, required, queryParams, ...(bodyParam ? { bodyParam } : {}) };
}

function objectLiteral(value, indent = 0) {
  return JSON.stringify(value, null, 2).replace(/"([^"]+)":/g, "$1:");
}

function testParams(endpoint) {
  const params = {};
  for (const key of endpoint.required ?? []) params[key] = `${key}-1`;
  if (endpoint.bodyParam) params[endpoint.bodyParam] = { name: "Example" };
  return params;
}

async function writePlugin(plugin) {
  const dir = path.join(root, "packages", "plugins", plugin.slug);
  const srcDir = path.join(dir, "src");
  const uiDir = path.join(srcDir, "ui");
  await fs.mkdir(uiDir, { recursive: true });
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
    ...(plugin.connectedAccountHeaderName ? { connectedAccountHeaderName: plugin.connectedAccountHeaderName } : {}),
    defaultScopes: plugin.defaultScopes,
    rawPathPrefixes: plugin.rawPathPrefixes,
    endpoints: plugin.endpoints.map(endpointObject),
  };
  await fs.writeFile(path.join(srcDir, "definition.ts"), `import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";\n\nexport const definition: LegalDefinition = ${objectLiteral(definition)};\n`);
  await fs.writeFile(path.join(srcDir, "manifest.ts"), `import { createLegalManifest } from "@kesarcloud/plugin-legal-core";\nimport { definition } from "./definition.js";\n\nexport default createLegalManifest(definition);\n`);
  await fs.writeFile(path.join(srcDir, "worker.ts"), `import { createLegalPlugin, runLegalWorker } from "@kesarcloud/plugin-legal-core";\nimport { definition } from "./definition.js";\n\nconst plugin = createLegalPlugin(definition);\n\nexport default plugin;\nrunLegalWorker(definition, import.meta.url);\n`);
  await fs.writeFile(path.join(srcDir, "index.ts"), `export { default as manifest } from "./manifest.js";\nexport { default as plugin } from "./worker.js";\nexport { definition } from "./definition.js";\n`);
  await fs.writeFile(path.join(uiDir, "index.tsx"), `import { createLegalUi } from "@kesarcloud/plugin-legal-core/ui";\nimport { definition } from "../definition.js";\n\nexport const {\n  LegalDashboardWidget,\n  LegalPage,\n  LegalSettingsPage,\n} = createLegalUi(definition, definition.id);\n`);

  const firstMutating = definition.endpoints.find((endpoint) => endpoint.mutating);
  const dryRunTest = firstMutating
    ? `\n  it("prepares mutating requests without calling external APIs in dry-run mode", async () => {\n    const fetchSpy = vi.spyOn(globalThis, "fetch");\n    const harness = createTestHarness({\n      manifest,\n      config: {\n        authMode: "token",\n        accessTokenSecretRef: "00000000-0000-4000-8000-000000000001",\n        connectedCompanyId: runCtx.companyId,\n        dryRun: true,\n      },\n    });\n    await plugin.definition.setup(harness.ctx);\n\n    const result = await harness.executeTool("${plugin.slug}.${firstMutating.key}", ${JSON.stringify(testParams(firstMutating), null, 6)}, runCtx);\n\n    expect(result.content).toContain("Dry run");\n    expect(fetchSpy).not.toHaveBeenCalled();\n    expect(result.data).toMatchObject({ dryRun: true });\n  });\n`
    : `\n  it("prepares guarded raw mutating requests without calling external APIs in dry-run mode", async () => {\n    const fetchSpy = vi.spyOn(globalThis, "fetch");\n    const harness = createTestHarness({\n      manifest,\n      config: {\n        authMode: "token",\n        accessTokenSecretRef: "00000000-0000-4000-8000-000000000001",\n        connectedCompanyId: runCtx.companyId,\n        dryRun: true,\n        enableRawApiTool: true,\n      },\n    });\n    await plugin.definition.setup(harness.ctx);\n\n    const result = await harness.executeTool("${plugin.slug}.apiRequest", { method: "POST", path: "${plugin.rawPathPrefixes[0]}", body: { name: "Example" } }, runCtx);\n\n    expect(result.content).toContain("Dry run");\n    expect(fetchSpy).not.toHaveBeenCalled();\n    expect(result.data).toMatchObject({ dryRun: true });\n  });\n`;
  await fs.writeFile(path.join(srcDir, "worker.test.ts"), `import { describe, expect, it, vi } from "vitest";\nimport { createTestHarness } from "@kesarcloud/plugin-sdk/testing";\nimport manifest from "./manifest.js";\nimport plugin from "./worker.js";\nimport { definition } from "./definition.js";\n\nconst runCtx = {\n  companyId: "company-1",\n  projectId: "project-1",\n  agentId: "agent-1",\n  runId: "run-1",\n};\n\ndescribe("${plugin.displayName} legal plugin", () => {\n  it("declares legal law category and core tools", () => {\n    expect(manifest.categories).toContain("legal_law");\n    expect(manifest.tools?.map((tool) => tool.name)).toContain(\`${"${definition.routePath}"}.apiRequest\`);\n  });\n${dryRunTest}});\n`);
  await fs.writeFile(path.join(dir, "package.json"), `${JSON.stringify({
    name: `@kesarcloud/plugin-${plugin.slug}`,
    version: "0.1.0",
    description: `First-party PaperClaw plugin for ${plugin.displayName} legal and law tools.`,
    type: "module",
    private: true,
    exports: { ".": "./src/index.ts" },
    paperclawPlugin: {
      manifest: "./dist/manifest.js",
      worker: "./dist/worker.js",
      ui: "./dist/ui/",
    },
    scripts: {
      prebuild: "pnpm --filter @kesarcloud/plugin-sdk ensure-build-deps",
      build: "tsc",
      clean: "rm -rf dist",
      test: `cd ../../.. && vitest run --project @kesarcloud/plugin-${plugin.slug}`,
      typecheck: "pnpm --filter @kesarcloud/plugin-sdk ensure-build-deps && tsc --noEmit",
    },
    dependencies: {
      "@kesarcloud/plugin-legal-core": "workspace:*",
      "@kesarcloud/plugin-sdk": "workspace:*",
    },
    devDependencies: commonDevDeps,
    peerDependencies: { react: ">=18" },
  }, null, 2)}\n`);
  await fs.writeFile(path.join(dir, "tsconfig.json"), `${JSON.stringify({
    extends: "../../../tsconfig.json",
    compilerOptions: {
      outDir: "dist",
      rootDir: "src",
      lib: ["ES2023", "DOM"],
      jsx: "react-jsx",
    },
    include: ["src"],
    exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
  }, null, 2)}\n`);
  await writeSkill(plugin);
}

async function writeSkill(plugin) {
  const dir = path.join(root, "marketplace", "skills", "tools", `${plugin.slug}-tools`);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "SKILL.md"), `---\nname: ${plugin.slug}-tools\ndescription: Use the PaperClaw ${plugin.displayName} Legal & Law plugin to let agents operate official ${plugin.displayName} APIs.\n---\n\n# ${plugin.displayName} Tools\n\nUse this skill when a marketplace micro-service agent needs to connect a PaperClaw company to ${plugin.displayName} for legal operations workflows.\n\n## Setup\n\n1. Install and enable the \`@kesarcloud/plugin-${plugin.slug}\` plugin.\n2. Open the plugin settings page.\n3. Configure an access token/API key or OAuth credentials where supported.\n4. Set any tenant, account, organization, region, or API base URL required by the vendor.\n5. Keep dry-run enabled while validating agent workflows.\n6. Switch to live only after board approval for mutating actions.\n\nAll mutating tools honor dry-run and write PaperClaw activity/audit entries. These tools automate legal records and documents; they do not provide legal advice.\n`);
}

for (const plugin of plugins) {
  await writePlugin(plugin);
}
