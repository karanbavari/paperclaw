---
title: Environment Variables
summary: Full environment variable reference
---

All environment variables that PaperClaw uses for server configuration.

## Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3100` | Server port |
| `PAPERCLAW_BIND` | `loopback` | Reachability preset: `loopback`, `lan`, `tailnet`, or `custom` |
| `PAPERCLAW_BIND_HOST` | (unset) | Required when `PAPERCLAW_BIND=custom` |
| `HOST` | `127.0.0.1` | Legacy host override; prefer `PAPERCLAW_BIND` for new setups |
| `DATABASE_URL` | (embedded) | PostgreSQL connection string |
| `PAPERCLAW_HOME` | `~/.paperclaw` | Base directory for all PaperClaw data |
| `PAPERCLAW_INSTANCE_ID` | `default` | Instance identifier (for multiple local instances) |
| `PAPERCLAW_DEPLOYMENT_MODE` | `local_trusted` | Runtime mode override |
| `PAPERCLAW_DEPLOYMENT_EXPOSURE` | `private` | Exposure policy when deployment mode is `authenticated` |
| `PAPERCLAW_API_URL` | (auto-derived) | PaperClaw API base URL. When set externally (e.g., via Kubernetes ConfigMap, load balancer, or reverse proxy), the server preserves the value instead of deriving it from the listen host and port. Useful for deployments where the public-facing URL differs from the local bind address. |

## Secrets

| Variable | Default | Description |
|----------|---------|-------------|
| `PAPERCLAW_SECRETS_MASTER_KEY` | (from file) | 32-byte encryption key (base64/hex/raw) |
| `PAPERCLAW_SECRETS_MASTER_KEY_FILE` | `~/.paperclaw/.../secrets/master.key` | Path to key file |
| `PAPERCLAW_SECRETS_STRICT_MODE` | `false` | Require secret refs for sensitive env vars |

## Agent Runtime (Injected into agent processes)

These are set automatically by the server when invoking agents:

| Variable | Description |
|----------|-------------|
| `PAPERCLAW_AGENT_ID` | Agent's unique ID |
| `PAPERCLAW_COMPANY_ID` | Company ID |
| `PAPERCLAW_API_URL` | PaperClaw API base URL (inherits the server-level value; see Server Configuration above) |
| `PAPERCLAW_API_KEY` | Short-lived JWT for API auth |
| `PAPERCLAW_RUN_ID` | Current heartbeat run ID |
| `PAPERCLAW_TASK_ID` | Issue that triggered this wake |
| `PAPERCLAW_WAKE_REASON` | Wake trigger reason |
| `PAPERCLAW_WAKE_COMMENT_ID` | Comment that triggered this wake |
| `PAPERCLAW_APPROVAL_ID` | Resolved approval ID |
| `PAPERCLAW_APPROVAL_STATUS` | Approval decision |
| `PAPERCLAW_LINKED_ISSUE_IDS` | Comma-separated linked issue IDs |

## LLM Provider Keys (for adapters)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude Local adapter) |
| `OPENAI_API_KEY` | OpenAI API key (for Codex Local adapter) |
