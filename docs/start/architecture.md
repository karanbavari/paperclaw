---
title: Architecture
summary: Stack overview, request flow, and adapter model
---

PaperClaw is a monorepo with four main layers.

## Stack Overview

```
┌─────────────────────────────────────┐
│  React UI (Vite)                    │
│  Dashboard, org, tasks, labs        │
├─────────────────────────────────────┤
│  Express.js REST API (Node.js)      │
│  Routes, services, auth, adapters   │
├─────────────────────────────────────┤
│  PostgreSQL (Drizzle ORM)           │
│  Schema, migrations, embedded mode  │
├─────────────────────────────────────┤
│  Adapters and Plugins               │
│  Local CLIs, process, HTTP, tools   │
└─────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, React Router 7, Radix UI, Tailwind CSS 4, TanStack Query |
| Backend | Node.js 20+, Express.js 5, TypeScript |
| Database | PostgreSQL 17 (or embedded PGlite), Drizzle ORM |
| Auth | Better Auth (sessions + API keys) |
| Adapters | Claude Code CLI, Codex CLI, Gemini, OpenCode, Pi, Cursor, shell process, HTTP webhook, OpenClaw gateway, external adapter plugins |
| Package manager | pnpm 9 with workspaces |

## Repository Structure

```
paperclaw/
├── ui/                          # React frontend
│   ├── src/pages/              # Route pages
│   ├── src/components/         # React components
│   ├── src/api/                # API client
│   └── src/context/            # React context providers
│
├── server/                      # Express.js API
│   ├── src/routes/             # REST endpoints
│   ├── src/services/           # Business logic
│   ├── src/adapters/           # Agent execution adapters
│   └── src/middleware/         # Auth, logging
│
├── packages/
│   ├── db/                      # Drizzle schema + migrations
│   ├── shared/                  # API types, constants, validators
│   ├── adapter-utils/           # Adapter interfaces and helpers
│   ├── adapters/                # Built-in local and gateway adapters
│   └── plugins/                 # Plugin SDK and first-party plugins
│
├── skills/                      # Agent skills
│   └── paperclaw/               # Core PaperClaw skill (heartbeat protocol)
│
├── cli/                         # CLI client
│   └── src/                     # Setup and control-plane commands
│
└── doc/                         # Internal documentation
```

## Request Flow

When a heartbeat fires:

1. **Trigger** — Scheduler, manual invoke, or event (assignment, mention) triggers a heartbeat
2. **Adapter invocation** — Server calls the configured adapter's `execute()` function
3. **Agent process** — Adapter spawns the agent (e.g. Claude Code CLI) with PaperClaw env vars and a prompt
4. **Agent work** — The agent calls PaperClaw's REST API to check assignments, checkout tasks, do work, and update status
5. **Result capture** — Adapter captures stdout, parses usage/cost data, extracts session state
6. **Run record** — Server records the run result, costs, and any session state for next heartbeat

## Adapter Model

Adapters are the bridge between PaperClaw and agent runtimes. Each adapter is a package with three modules:

- **Server module** — `execute()` function that spawns/calls the agent, plus environment diagnostics
- **UI module** — stdout parser for the run viewer, config form fields for agent creation
- **CLI module** — terminal formatter for `paperclaw run --watch`

Built-in adapters include local CLI/session adapters, process, HTTP, and OpenClaw gateway support. External adapter plugins can add runtimes without modifying PaperClaw core.

## Key Design Decisions

- **Control plane, not execution plane** — PaperClaw orchestrates agents; it doesn't run them
- **Company-scoped** — all entities belong to exactly one company; strict data boundaries
- **Single-assignee tasks** — atomic checkout prevents concurrent work on the same task
- **Adapter-agnostic** — any runtime that can call an HTTP API works as an agent
- **Embedded by default** — zero-config local mode with embedded PostgreSQL

## Core Systems

- **Work and governance** — issues, goals, routines, approvals, budgets, inbox, and activity log
- **Agent organization** — agents, org chart, permissions, adapter configs, and managed instructions
- **Execution workspace runtime** — durable workspaces, branch/worktree metadata, commands, services, and preview URLs
- **Company knowledge** — company profile, default language, currency, timezone, short-term memory, and long-term knowledge
- **Research Lab** — selected-agent R&D spaces linked to projects, execution workspaces, demo URLs, final reports, CEO review, and board approvals
- **Skills and marketplace** — local company skill library plus remote marketplace discovery and governed installation
