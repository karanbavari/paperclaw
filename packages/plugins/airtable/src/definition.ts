import type { ProductivityDefinition } from "@kesarcloud/plugin-productivity-core";

export const definition: ProductivityDefinition = {
  id: "paperclaw.airtable",
  packageName: "@kesarcloud/plugin-airtable",
  version: "0.1.0",
  displayName: "Airtable",
  routePath: "airtable",
  description: "Connects PaperClaw agents to Airtable for bases, table metadata, records, search-style listing, and batch record operations.",
  apiBaseUrl: "https://api.airtable.com/v0",
  authUrl: "https://airtable.com/oauth2/v1/authorize",
  tokenUrl: "https://airtable.com/oauth2/v1/token",
  tokenAuthStyle: "basic",
  tokenLabel: "Airtable Personal Access Token",
  oauthLabel: "Airtable OAuth",
  connectedLabel: "Connected Base/Workspace",
  defaultScopes: ["data.records:read","data.records:write","schema.bases:read"],
  rawPathPrefixes: ["/","/meta/"],
  endpoints: [
    { key: "basesList", displayName: "List Airtable Bases", description: "List bases.", method: "GET", path: "/meta/bases", mutating: false, required: [], queryParams: ["offset"] },
    { key: "tablesList", displayName: "List Airtable Tables", description: "List base tables.", method: "GET", path: "/meta/bases/{baseId}/tables", mutating: false, required: ["baseId"], queryParams: [] },
    { key: "recordsList", displayName: "List Airtable Records", description: "List table records.", method: "GET", path: "/{baseId}/{tableIdOrName}", mutating: false, required: ["baseId","tableIdOrName"], queryParams: ["pageSize","offset","filterByFormula","view"] },
    { key: "recordGet", displayName: "Get Airtable Record", description: "Get a record.", method: "GET", path: "/{baseId}/{tableIdOrName}/{recordId}", mutating: false, required: ["baseId","tableIdOrName","recordId"], queryParams: [] },
    { key: "recordsCreate", displayName: "Create Airtable Records", description: "Create records.", method: "POST", path: "/{baseId}/{tableIdOrName}", mutating: true, required: ["baseId","tableIdOrName"], queryParams: [], bodyParam: "records" },
    { key: "recordsUpdate", displayName: "Update Airtable Records", description: "Update records.", method: "PATCH", path: "/{baseId}/{tableIdOrName}", mutating: true, required: ["baseId","tableIdOrName"], queryParams: [], bodyParam: "records" },
    { key: "recordsDelete", displayName: "Delete Airtable Records", description: "Delete records.", method: "DELETE", path: "/{baseId}/{tableIdOrName}", mutating: true, required: ["baseId","tableIdOrName"], queryParams: ["records[]"] },
  ],
};
