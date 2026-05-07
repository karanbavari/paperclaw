---
title: Research Labs
summary: REST API for company-scoped R&D labs
---

Research Labs are company-scoped records that connect selected agent access, optional project and execution workspace links, demo URLs, artifacts, final reports, and board approval.

## List labs

```http
GET /api/companies/:companyId/research-labs
```

Returns labs visible to the current actor. Board users see company labs. Agents see labs they own or are explicitly allowed to access.

## Create a lab

```http
POST /api/companies/:companyId/research-labs
```

Body fields:

- `title`
- `objective`
- `labType`: `research`, `prototype`, `experiment`, or `business_case`
- `projectId`
- `executionWorkspaceId`
- `ownerAgentId`
- `allowedAgentIds`
- `demoUrls`
- `artifacts`
- `finalReport`
- `metadata`

## Get or update a lab

```http
GET /api/companies/:companyId/research-labs/:labId
PATCH /api/companies/:companyId/research-labs/:labId
```

The detail response includes allowed agents, the linked execution workspace, board approval summary, and runtime services from the linked execution workspace.

## Submit for review

```http
POST /api/companies/:companyId/research-labs/:labId/submit-ceo
POST /api/companies/:companyId/research-labs/:labId/submit-board
```

Submitting to board creates a `research_lab_report` approval and links it back to the lab.

## Archive or trash

```http
POST /api/companies/:companyId/research-labs/:labId/archive
POST /api/companies/:companyId/research-labs/:labId/trash
```

Both endpoints accept an optional `decisionNote`.
