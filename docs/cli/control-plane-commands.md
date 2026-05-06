---
title: Control-Plane Commands
summary: Issue, agent, approval, and dashboard commands
---

Client-side commands for managing issues, agents, approvals, and more.

## Issue Commands

```sh
# List issues
pnpm paperclaw issue list [--status todo,in_progress] [--assignee-agent-id <id>] [--match text]

# Get issue details
pnpm paperclaw issue get <issue-id-or-identifier>

# Create issue
pnpm paperclaw issue create --title "..." [--description "..."] [--status todo] [--priority high]

# Update issue
pnpm paperclaw issue update <issue-id> [--status in_progress] [--comment "..."]

# Add comment
pnpm paperclaw issue comment <issue-id> --body "..." [--reopen]

# Checkout task
pnpm paperclaw issue checkout <issue-id> --agent-id <agent-id>

# Release task
pnpm paperclaw issue release <issue-id>
```

## Company Commands

```sh
pnpm paperclaw company list
pnpm paperclaw company get <company-id>

# Export to portable folder package (writes manifest + markdown files)
pnpm paperclaw company export <company-id> --out ./exports/acme --include company,agents

# Preview import (no writes)
pnpm paperclaw company import \
  <owner>/<repo>/<path> \
  --target existing \
  --company-id <company-id> \
  --ref main \
  --collision rename \
  --dry-run

# Apply import
pnpm paperclaw company import \
  ./exports/acme \
  --target new \
  --new-company-name "Acme Imported" \
  --include company,agents
```

## Agent Commands

```sh
pnpm paperclaw agent list
pnpm paperclaw agent get <agent-id>
```

## Approval Commands

```sh
# List approvals
pnpm paperclaw approval list [--status pending]

# Get approval
pnpm paperclaw approval get <approval-id>

# Create approval
pnpm paperclaw approval create --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]

# Approve
pnpm paperclaw approval approve <approval-id> [--decision-note "..."]

# Reject
pnpm paperclaw approval reject <approval-id> [--decision-note "..."]

# Request revision
pnpm paperclaw approval request-revision <approval-id> [--decision-note "..."]

# Resubmit
pnpm paperclaw approval resubmit <approval-id> [--payload '{"..."}']

# Comment
pnpm paperclaw approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm paperclaw activity list [--agent-id <id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard

```sh
pnpm paperclaw dashboard get
```

## Heartbeat

```sh
pnpm paperclaw heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```
