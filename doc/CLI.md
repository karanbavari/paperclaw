# CLI Reference

PaperClaw CLI now supports both:

- instance setup/diagnostics (`onboard`, `doctor`, `configure`, `env`, `allowed-hostname`, `env-lab`)
- control-plane client operations (issues, approvals, agents, activity, dashboard)

## Base Usage

Use repo script in development:

```sh
pnpm paperclaw --help
```

First-time local bootstrap + run:

```sh
pnpm paperclaw run
```

Choose local instance:

```sh
pnpm paperclaw run --instance dev
```

## Deployment Modes

Mode taxonomy and design intent are documented in `doc/DEPLOYMENT-MODES.md`.

Current CLI behavior:

- `paperclaw onboard` and `paperclaw configure --section server` set deployment mode in config
- server onboarding/configure ask for reachability intent and write `server.bind`
- `paperclaw run --bind <loopback|lan|tailnet>` passes a quickstart bind preset into first-run onboarding when config is missing
- runtime can override mode with `PAPERCLAW_DEPLOYMENT_MODE`
- `paperclaw run` and `paperclaw doctor` still do not expose a direct low-level `--mode` flag

Canonical behavior is documented in `doc/DEPLOYMENT-MODES.md`.

Allow an authenticated/private hostname (for example custom Tailscale DNS):

```sh
pnpm paperclaw allowed-hostname dotta-macbook-pro
```

Bring up the default local SSH fixture for environment testing:

```sh
pnpm paperclaw env-lab up
pnpm paperclaw env-lab doctor
pnpm paperclaw env-lab status --json
pnpm paperclaw env-lab down
```

All client commands support:

- `--data-dir <path>`
- `--api-base <url>`
- `--api-key <token>`
- `--context <path>`
- `--profile <name>`
- `--json`

Company-scoped commands also support `--company-id <id>`.

Use `--data-dir` on any CLI command to isolate all default local state (config/context/db/logs/storage/secrets) away from `~/.paperclaw`:

```sh
pnpm paperclaw run --data-dir ./tmp/paperclaw-dev
pnpm paperclaw issue list --data-dir ./tmp/paperclaw-dev
```

## Context Profiles

Store local defaults in `~/.paperclaw/context.json`:

```sh
pnpm paperclaw context set --api-base http://localhost:3100 --company-id <company-id>
pnpm paperclaw context show
pnpm paperclaw context list
pnpm paperclaw context use default
```

To avoid storing secrets in context, set `apiKeyEnvVarName` and keep the key in env:

```sh
pnpm paperclaw context set --api-key-env-var-name PAPERCLAW_API_KEY
export PAPERCLAW_API_KEY=...
```

## Company Commands

```sh
pnpm paperclaw company list
pnpm paperclaw company get <company-id>
pnpm paperclaw company delete <company-id-or-prefix> --yes --confirm <same-id-or-prefix>
```

Examples:

```sh
pnpm paperclaw company delete PAP --yes --confirm PAP
pnpm paperclaw company delete 5cbe79ee-acb3-4597-896e-7662742593cd --yes --confirm 5cbe79ee-acb3-4597-896e-7662742593cd
```

Notes:

- Deletion is server-gated by `PAPERCLAW_ENABLE_COMPANY_DELETION`.
- With agent authentication, company deletion is company-scoped. Use the current company ID/prefix (for example via `--company-id` or `PAPERCLAW_COMPANY_ID`), not another company.

## Issue Commands

```sh
pnpm paperclaw issue list --company-id <company-id> [--status todo,in_progress] [--assignee-agent-id <agent-id>] [--match text]
pnpm paperclaw issue get <issue-id-or-identifier>
pnpm paperclaw issue create --company-id <company-id> --title "..." [--description "..."] [--status todo] [--priority high]
pnpm paperclaw issue update <issue-id> [--status in_progress] [--comment "..."]
pnpm paperclaw issue comment <issue-id> --body "..." [--reopen]
pnpm paperclaw issue checkout <issue-id> --agent-id <agent-id> [--expected-statuses todo,backlog,blocked]
pnpm paperclaw issue release <issue-id>
```

## Agent Commands

```sh
pnpm paperclaw agent list --company-id <company-id>
pnpm paperclaw agent get <agent-id>
pnpm paperclaw agent local-cli <agent-id-or-shortname> --company-id <company-id>
```

`agent local-cli` is the quickest way to run local Claude/Codex manually as a PaperClaw agent:

- creates a new long-lived agent API key
- installs missing PaperClaw skills into `~/.codex/skills` and `~/.claude/skills`
- prints `export ...` lines for `PAPERCLAW_API_URL`, `PAPERCLAW_COMPANY_ID`, `PAPERCLAW_AGENT_ID`, and `PAPERCLAW_API_KEY`

Example for shortname-based local setup:

```sh
pnpm paperclaw agent local-cli codexcoder --company-id <company-id>
pnpm paperclaw agent local-cli claudecoder --company-id <company-id>
```

## Approval Commands

```sh
pnpm paperclaw approval list --company-id <company-id> [--status pending]
pnpm paperclaw approval get <approval-id>
pnpm paperclaw approval create --company-id <company-id> --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]
pnpm paperclaw approval approve <approval-id> [--decision-note "..."]
pnpm paperclaw approval reject <approval-id> [--decision-note "..."]
pnpm paperclaw approval request-revision <approval-id> [--decision-note "..."]
pnpm paperclaw approval resubmit <approval-id> [--payload '{"...":"..."}']
pnpm paperclaw approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm paperclaw activity list --company-id <company-id> [--agent-id <agent-id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard Commands

```sh
pnpm paperclaw dashboard get --company-id <company-id>
```

## Heartbeat Command

`heartbeat run` now also supports context/api-key options and uses the shared client stack:

```sh
pnpm paperclaw heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100] [--api-key <token>]
```

## Local Storage Defaults

Default local instance root is `~/.paperclaw/instances/default`:

- config: `~/.paperclaw/instances/default/config.json`
- embedded db: `~/.paperclaw/instances/default/db`
- logs: `~/.paperclaw/instances/default/logs`
- storage: `~/.paperclaw/instances/default/data/storage`
- secrets key: `~/.paperclaw/instances/default/secrets/master.key`

Override base home or instance with env vars:

```sh
PAPERCLAW_HOME=/custom/home PAPERCLAW_INSTANCE_ID=dev pnpm paperclaw run
```

## Storage Configuration

Configure storage provider and settings:

```sh
pnpm paperclaw configure --section storage
```

Supported providers:

- `local_disk` (default; local single-user installs)
- `s3` (S3-compatible object storage)
