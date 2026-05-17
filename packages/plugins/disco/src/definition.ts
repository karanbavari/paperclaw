import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.disco",
  packageName: "@kesarcloud/plugin-disco",
  version: "0.1.0",
  displayName: "DISCO",
  routePath: "disco",
  description: "Connects PaperClaw agents to DISCO Ediscovery's organization API for datasets, metrics, metadata, and operational reporting.",
  apiBaseUrl: "https://api.csdisco.com",
  tokenLabel: "DISCO API Key",
  oauthLabel: "DISCO OAuth",
  connectedLabel: "Organization ID",
  authScheme: "api-key",
  accessTokenHeaderName: "disco-api-key",
  connectedAccountHeaderName: "organization-id",
  defaultScopes: [
    "read"
  ],
  rawPathPrefixes: [
    "/datasets",
    "/metrics",
    "/metadata"
  ],
  endpoints: [
    {
      key: "datasetsList",
      displayName: "List DISCO Datasets",
      description: "List available datasets.",
      method: "POST",
      path: "/datasets",
      mutating: false,
      required: [],
      queryParams: []
    },
    {
      key: "datasetMetadata",
      displayName: "Get DISCO Dataset Metadata",
      description: "Get dataset metadata.",
      method: "GET",
      path: "/datasets/{datasetName}/metadata",
      mutating: false,
      required: [
        "datasetName"
      ],
      queryParams: []
    },
    {
      key: "datasetQuery",
      displayName: "Query DISCO Dataset",
      description: "Query a dataset.",
      method: "POST",
      path: "/datasets/{datasetName}",
      mutating: false,
      required: [
        "datasetName"
      ],
      queryParams: [],
      bodyParam: "body"
    },
    {
      key: "metricsList",
      displayName: "List DISCO Metrics",
      description: "List available metrics.",
      method: "POST",
      path: "/metrics",
      mutating: false,
      required: [],
      queryParams: []
    },
    {
      key: "metricQuery",
      displayName: "Query DISCO Metric",
      description: "Query a metric.",
      method: "POST",
      path: "/metrics/{metricName}",
      mutating: false,
      required: [
        "metricName"
      ],
      queryParams: [],
      bodyParam: "body"
    },
    {
      key: "metadataList",
      displayName: "List DISCO Metadata",
      description: "List API metadata.",
      method: "POST",
      path: "/metadata",
      mutating: false,
      required: [],
      queryParams: []
    }
  ]
};
