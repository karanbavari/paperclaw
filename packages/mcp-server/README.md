# PaperClaw MCP Server

Model Context Protocol server for PaperClaw.

This package is a thin MCP wrapper over the existing PaperClaw REST API. It does
not talk to the database directly and it does not reimplement business logic.

## Authentication

The server reads its configuration from environment variables:

- `PAPERCLAW_API_URL` - PaperClaw base URL, for example `http://localhost:3100`
- `PAPERCLAW_API_KEY` - bearer token used for `/api` requests
- `PAPERCLAW_COMPANY_ID` - optional default company for company-scoped tools
- `PAPERCLAW_AGENT_ID` - optional default agent for checkout helpers
- `PAPERCLAW_RUN_ID` - optional run id forwarded on mutating requests

## Usage

```sh
npx -y @kesarcloud/mcp-server
```

Or locally in this repo:

```sh
pnpm --filter @kesarcloud/mcp-server build
node packages/mcp-server/dist/stdio.js
```

## Tool Surface

Read tools:

- `paperclawMe`
- `paperclawInboxLite`
- `paperclawListAgents`
- `paperclawGetAgent`
- `paperclawListIssues`
- `paperclawGetIssue`
- `paperclawGetHeartbeatContext`
- `paperclawListComments`
- `paperclawGetComment`
- `paperclawListIssueApprovals`
- `paperclawListDocuments`
- `paperclawGetDocument`
- `paperclawListDocumentRevisions`
- `paperclawListProjects`
- `paperclawGetProject`
- `paperclawGetIssueWorkspaceRuntime`
- `paperclawWaitForIssueWorkspaceService`
- `paperclawListGoals`
- `paperclawGetGoal`
- `paperclawListApprovals`
- `paperclawGetApproval`
- `paperclawGetApprovalIssues`
- `paperclawListApprovalComments`

Write tools:

- `paperclawCreateIssue`
- `paperclawUpdateIssue`
- `paperclawCheckoutIssue`
- `paperclawReleaseIssue`
- `paperclawAddComment`
- `paperclawSuggestTasks`
- `paperclawAskUserQuestions`
- `paperclawRequestConfirmation`
- `paperclawUpsertIssueDocument`
- `paperclawRestoreIssueDocumentRevision`
- `paperclawControlIssueWorkspaceServices`
- `paperclawCreateApproval`
- `paperclawLinkIssueApproval`
- `paperclawUnlinkIssueApproval`
- `paperclawApprovalDecision`
- `paperclawAddApprovalComment`

Escape hatch:

- `paperclawApiRequest`

`paperclawApiRequest` is limited to paths under `/api` and JSON bodies. It is
meant for endpoints that do not yet have a dedicated MCP tool.
