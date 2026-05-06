---
title: Setup Commands
summary: Onboard, run, doctor, and configure
---

Instance setup and diagnostics commands.

## `paperclaw run`

One-command bootstrap and start:

```sh
pnpm paperclaw run
```

Does:

1. Auto-onboards if config is missing
2. Runs `paperclaw doctor` with repair enabled
3. Starts the server when checks pass

Choose a specific instance:

```sh
pnpm paperclaw run --instance dev
```

## `paperclaw onboard`

Interactive first-time setup:

```sh
pnpm paperclaw onboard
```

If PaperClaw is already configured, rerunning `onboard` keeps the existing config in place. Use `paperclaw configure` to change settings on an existing install.

First prompt:

1. `Quickstart` (recommended): local defaults (embedded database, no LLM provider, local disk storage, default secrets)
2. `Advanced setup`: full interactive configuration

Start immediately after onboarding:

```sh
pnpm paperclaw onboard --run
```

Non-interactive defaults + immediate start (opens browser on server listen):

```sh
pnpm paperclaw onboard --yes
```

On an existing install, `--yes` now preserves the current config and just starts PaperClaw with that setup.

## `paperclaw doctor`

Health checks with optional auto-repair:

```sh
pnpm paperclaw doctor
pnpm paperclaw doctor --repair
```

Validates:

- Server configuration
- Database connectivity
- Secrets adapter configuration
- Storage configuration
- Missing key files

## `paperclaw configure`

Update configuration sections:

```sh
pnpm paperclaw configure --section server
pnpm paperclaw configure --section secrets
pnpm paperclaw configure --section storage
```

## `paperclaw env`

Show resolved environment configuration:

```sh
pnpm paperclaw env
```

This now includes bind-oriented deployment settings such as `PAPERCLAW_BIND` and `PAPERCLAW_BIND_HOST` when configured.

## `paperclaw allowed-hostname`

Allow a private hostname for authenticated/private mode:

```sh
pnpm paperclaw allowed-hostname my-tailscale-host
```

## Local Storage Paths

| Data | Default Path |
|------|-------------|
| Config | `~/.paperclaw/instances/default/config.json` |
| Database | `~/.paperclaw/instances/default/db` |
| Logs | `~/.paperclaw/instances/default/logs` |
| Storage | `~/.paperclaw/instances/default/data/storage` |
| Secrets key | `~/.paperclaw/instances/default/secrets/master.key` |

Override with:

```sh
PAPERCLAW_HOME=/custom/home PAPERCLAW_INSTANCE_ID=dev pnpm paperclaw run
```

Or pass `--data-dir` directly on any command:

```sh
pnpm paperclaw run --data-dir ./tmp/paperclaw-dev
pnpm paperclaw doctor --data-dir ./tmp/paperclaw-dev
```
