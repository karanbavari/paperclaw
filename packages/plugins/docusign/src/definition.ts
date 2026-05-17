import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.docusign",
  packageName: "@kesarcloud/plugin-docusign",
  version: "0.1.0",
  displayName: "DocuSign",
  routePath: "docusign",
  description: "Connects PaperClaw agents to DocuSign eSignature for envelopes, templates, recipients, documents, status, and tabs.",
  apiBaseUrl: "https://demo.docusign.net/restapi/v2.1",
  authUrl: "https://account-d.docusign.com/oauth/auth",
  tokenUrl: "https://account-d.docusign.com/oauth/token",
  tokenAuthStyle: "basic",
  tokenLabel: "DocuSign Access Token",
  oauthLabel: "DocuSign OAuth",
  connectedLabel: "Account ID",
  apiBaseUrlLabel: "DocuSign REST API Base URL",
  defaultScopes: [
    "signature",
    "impersonation"
  ],
  rawPathPrefixes: [
    "/accounts/"
  ],
  endpoints: [
    {
      key: "envelopesList",
      displayName: "List DocuSign Envelopes",
      description: "List envelopes.",
      method: "GET",
      path: "/accounts/{accountId}/envelopes",
      mutating: false,
      required: [
        "accountId"
      ],
      queryParams: [
        "from_date",
        "status",
        "count",
        "start_position"
      ]
    },
    {
      key: "envelopeGet",
      displayName: "Get DocuSign Envelope",
      description: "Get envelope details.",
      method: "GET",
      path: "/accounts/{accountId}/envelopes/{envelopeId}",
      mutating: false,
      required: [
        "accountId",
        "envelopeId"
      ],
      queryParams: []
    },
    {
      key: "envelopeCreate",
      displayName: "Create DocuSign Envelope",
      description: "Create or send an envelope.",
      method: "POST",
      path: "/accounts/{accountId}/envelopes",
      mutating: true,
      required: [
        "accountId"
      ],
      queryParams: [],
      bodyParam: "envelope"
    },
    {
      key: "templatesList",
      displayName: "List DocuSign Templates",
      description: "List templates.",
      method: "GET",
      path: "/accounts/{accountId}/templates",
      mutating: false,
      required: [
        "accountId"
      ],
      queryParams: [
        "count",
        "start_position",
        "search_text"
      ]
    },
    {
      key: "templateGet",
      displayName: "Get DocuSign Template",
      description: "Get a template.",
      method: "GET",
      path: "/accounts/{accountId}/templates/{templateId}",
      mutating: false,
      required: [
        "accountId",
        "templateId"
      ],
      queryParams: []
    },
    {
      key: "recipientsList",
      displayName: "List DocuSign Recipients",
      description: "List envelope recipients.",
      method: "GET",
      path: "/accounts/{accountId}/envelopes/{envelopeId}/recipients",
      mutating: false,
      required: [
        "accountId",
        "envelopeId"
      ],
      queryParams: []
    },
    {
      key: "documentsList",
      displayName: "List DocuSign Documents",
      description: "List envelope documents.",
      method: "GET",
      path: "/accounts/{accountId}/envelopes/{envelopeId}/documents",
      mutating: false,
      required: [
        "accountId",
        "envelopeId"
      ],
      queryParams: []
    },
    {
      key: "tabsList",
      displayName: "List DocuSign Tabs",
      description: "List recipient tabs.",
      method: "GET",
      path: "/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientId}/tabs",
      mutating: false,
      required: [
        "accountId",
        "envelopeId",
        "recipientId"
      ],
      queryParams: []
    },
    {
      key: "reminderSend",
      displayName: "Send DocuSign Reminder",
      description: "Send an envelope reminder.",
      method: "PUT",
      path: "/accounts/{accountId}/envelopes/{envelopeId}",
      mutating: true,
      required: [
        "accountId",
        "envelopeId"
      ],
      queryParams: [],
      bodyParam: "envelope"
    }
  ]
};
