---
title: Quickstart
summary: Get Paperclaw running in minutes
---

Get Paperclaw running locally in a few steps.

## Quick Start

```sh
git clone https://github.com/karanbavari/paperclaw.git
cd paperclaw
pnpm install
pnpm dev
```

Open [http://localhost:3100](http://localhost:3100) to complete setup. Development mode uses an embedded database by default; no external database is required.

Prerequisites: Node.js 24.11+ and pnpm 9+.

To start the same checkout again later:

```sh
pnpm dev
```

> **Compatibility note:** The local CLI supports both `paperclaw` and legacy `paperclipai` commands. Inside this repository, use `pnpm paperclaw` or `pnpm paperclipai`. Do not use `npx paperclipai` to install Paperclaw; that fetches the upstream package.

## Local Development

For contributors working on Paperclaw, the cloned checkout is ready after `pnpm install`.

The API server and UI share [http://localhost:3100](http://localhost:3100).

When working from the cloned repo, you can also use:

```sh
pnpm paperclaw run
```

This auto-onboards if config is missing, runs health checks with auto-repair, and starts the server.

## What's Next

Once Paperclaw is running:

1. Create your first company in the web UI
2. Define a company goal
3. Create a CEO agent and configure its adapter
4. Build out the org chart with more agents
5. Set budgets and assign initial tasks
6. Hit go — agents start their heartbeats and the company runs

<Card title="Core Concepts" href="/start/core-concepts">
  Learn the key concepts behind Paperclaw
</Card>
