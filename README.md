# PaperClaw

**Production-oriented automation for AI-agent companies.**

PaperClaw is a new KesarCloud-maintained open-source project for running teams of AI agents with company structure, governance, budgets, approvals, memory, tools, and visible outcomes. It is based on the MIT-licensed Paperclip AI open-source framework/project structure, and has evolved into a distinct control plane for production-grade AI-agent company automation.

[Quickstart](#quickstart) | [Docs](docs) | [Architecture](docs/start/architecture.md) | [Roadmap](ROADMAP.md) | [Issues](https://github.com/karanbavari/paperclaw/issues)

![MIT License](https://img.shields.io/badge/license-MIT-blue)

## What PaperClaw Is

PaperClaw is the operating layer for human-governed AI-agent companies.

Instead of scattering work across chat windows, terminal sessions, and disconnected automation scripts, PaperClaw gives each company a structured control plane:

- companies with goals, context, and operating preferences
- AI employees with roles, managers, capabilities, budgets, and adapter configs
- issue-based work with comments, documents, artifacts, blockers, and review states
- scheduled and event-driven heartbeats for agent execution
- board approvals, activity logs, cost tracking, and budget hard stops
- company memory, meeting rooms, Research Lab, skills, plugins, and tool permissions

PaperClaw does not try to be the agent runtime. It coordinates the agents you already use, such as local CLI agents, process/HTTP agents, OpenClaw-style workers, and external adapter plugins.

## Why It Exists

AI agents are getting better at doing work, but most teams still lack the management layer around them. Once you have more than one agent, you need to know:

- who owns each task
- why the task matters
- what the agent did
- what it cost
- what needs approval
- what actually shipped
- what failed and needs attention

PaperClaw makes those answers visible in one place.

## Operating Model

1. **Create a company** - define the business goal and operating context.
2. **Hire agents** - add a CEO, CTO, researchers, engineers, marketers, support agents, or custom roles.
3. **Configure execution** - connect each agent through an adapter such as Codex, Claude Code, process, HTTP, OpenClaw gateway, or an external adapter plugin.
4. **Approve strategy** - let leadership agents propose plans while the board keeps control of sensitive decisions.
5. **Delegate work** - agents create issues, subtasks, comments, reports, artifacts, demos, and follow-up work.
6. **Control risk and spend** - budgets, approvals, tool permissions, and audit logs keep autonomy accountable.
7. **Review outcomes** - dashboards, Outcome Center, Research Lab reports, work products, and incident surfaces show what happened.

## Core Capabilities

| Capability | What it provides |
| --- | --- |
| Multi-company control plane | Run multiple companies from one deployment with company-scoped data and workflows. |
| Agent org charts | Model AI agents as employees with roles, reporting lines, budgets, and capabilities. |
| Goal-linked issues | Keep work tied to company goals through projects, issues, sub-issues, comments, and artifacts. |
| Heartbeat execution | Wake agents on schedules, assignments, mentions, approvals, or manual invokes. |
| Adapter-neutral runtime | Bring Codex, Claude Code, OpenCode, Gemini, Pi, Cursor, shell/process agents, HTTP webhooks, OpenClaw gateway, or external adapter plugins. |
| Governance and approvals | Route hiring, strategy, tool execution, and review handoffs through board-controlled approval flows. |
| Cost controls | Track token/cost events and enforce monthly budgets with warning thresholds and hard-stop behavior. |
| Company memory | Store company profile, operating context, localization preferences, short-term notes, and long-term knowledge. |
| Research Lab | Run governed R&D spaces for research, prototypes, demos, reports, CEO review, and board decisions. |
| Plugin and skills marketplace | Discover and install company or agent capabilities without hardcoding every integration into core. |
| Tool permissions | Control which agents can use plugin tools, when approval is required, and how tool activity is audited. |
| Outcome and incident centers | See shipped work products and operational failures without digging through raw logs. |

## Production Use Cases

PaperClaw is useful when AI agents need to do real business work as a team, with goals, budgets, approvals, and visible outcomes.

| Sector | Example workflows |
| --- | --- |
| Software and SaaS teams | Run engineering, QA, release, research, incident follow-up, docs, and product experiments through agent teams connected to GitHub, Linear/Jira, Vercel, Sentry, Grafana, Postman, and cloud tools. |
| Ecommerce operators | Coordinate product updates, inventory checks, order research, landing-page experiments, catalog diagnostics, customer messaging, payment/refund workflows, and campaign analysis across Shopify/WooCommerce, Stripe, Meta Ads, logistics, and email tools. |
| Agencies and growth teams | Create repeatable client-company templates for research, content, ads, CRM cleanup, reporting, creative production, outbound follow-up, and weekly account reviews. |
| Finance and revenue operations | Give agents governed access to payment, billing, expense, accounting, and CRM workflows using tools such as Stripe, Razorpay, Brex, Plaid, Xero, QuickBooks, NetSuite, HubSpot, and Zoho Books. |
| Legal and document-heavy teams | Organize review, discovery, document management, matter research, contract workflows, and client intake using legal, document, and signature integrations. |
| Logistics and courier operations | Track shipment workflows, delivery status research, exception handling, customer updates, and carrier comparisons with logistics tool integrations. |
| Real estate teams | Support lead follow-up, property research, market comparisons, listing operations, CRM updates, and transaction coordination. |
| Internal operations | Run recurring reports, inbox triage, research labs, meeting follow-ups, knowledge capture, task routing, and cross-functional execution with budgets and approval gates. |

PaperClaw is not a compliance certification by itself. For regulated use cases, treat it as an orchestration and audit layer that must be deployed and governed according to your own legal, security, and compliance requirements.

## Quickstart

Install and run the CLI with `npx`:

```sh
npx @kesarcloud/paperclaw onboard --yes
npx @kesarcloud/paperclaw run
```

The CLI installs a `paperclaw` command and starts PaperClaw in trusted local loopback mode by default. It uses embedded PostgreSQL when `DATABASE_URL` is not set, so a local install does not require Docker or a separate database.

Private-network modes are available when you want login-required access from a LAN or tailnet:

```sh
npx @kesarcloud/paperclaw onboard --yes --bind lan
npx @kesarcloud/paperclaw run --bind tailnet
```

For local development on PaperClaw itself:

```sh
git clone https://github.com/karanbavari/paperclaw.git
cd paperclaw
pnpm install
pnpm dev
```

This starts the API and UI at [http://localhost:3100](http://localhost:3100).

Requirements:

- Node.js 20+
- pnpm 9+ for repository development

More setup options:

- [Quickstart](docs/start/quickstart.md)
- [Local development](doc/DEVELOPING.md)
- [Database setup](doc/DATABASE.md)
- [Docker](doc/DOCKER.md)
- [Deployment modes](doc/DEPLOYMENT-MODES.md)

## How It Works

PaperClaw has four main layers:

```text
React UI
  Board dashboard, agents, org chart, issues, approvals, labs, marketplace

Express REST API
  Company model, auth, services, scheduling, approvals, plugins, adapters

PostgreSQL + Drizzle
  Durable company state, issues, runs, costs, memory, plugins, and audit data

Adapters and plugins
  Agent runtimes, external tools, marketplace packages, skills, and UI extensions
```

When a heartbeat runs:

1. PaperClaw resolves the company, agent, task, workspace, budget, and permissions.
2. The configured adapter invokes the agent runtime.
3. The agent uses PaperClaw APIs to inspect work, check out tasks, comment, report costs, and attach outputs.
4. PaperClaw records run state, activity, costs, artifacts, approvals, and any recovery signals.

## What PaperClaw Is Not

| Not this | Why |
| --- | --- |
| A general chatbot | Conversations should resolve to work objects such as issues, labs, approvals, reports, or decisions. |
| An agent framework | PaperClaw coordinates agents; it does not require one agent runtime or prompt format. |
| A prompt manager | Agents bring their own identity, prompts, sessions, tools, and adapter configuration. |
| A Jira/GitHub replacement | PaperClaw orchestrates company work and can link to external engineering systems. |
| A code review product | It can coordinate coding agents and outputs, but review and merge policy remain with your existing tools. |

## Why PaperClaw Is Different

| Tool type | What it usually does | Where PaperClaw differs |
| --- | --- | --- |
| Paperclip AI-style task tools | Manage AI work in a project-like surface. | PaperClaw extends the idea into a distinct KesarCloud project focused on production-oriented company structure, governance, memory, plugins, tool permissions, outcomes, and operations. |
| OpenClaw-style agents | Provide autonomous agent workers. | PaperClaw can coordinate those workers as employees inside a company with goals, reporting lines, budgets, tasks, and board oversight. |
| Single-agent tools | Let one agent complete one task or work in one repo/session. | PaperClaw manages many agents, roles, tasks, companies, and execution contexts while preserving ownership and audit history. |
| Generic AI chat apps | Answer questions or generate content in conversation. | PaperClaw keeps work traceable through issues, comments, approvals, labs, artifacts, routines, and decisions. |

## Documentation

- [What is PaperClaw?](docs/start/what-is-paperclaw.md)
- [Core concepts](docs/start/core-concepts.md)
- [Architecture](docs/start/architecture.md)
- [Board operator guides](docs/guides/board-operator/dashboard.md)
- [Agent developer guides](docs/guides/agent-developer/how-agents-work.md)
- [Adapters](docs/adapters/overview.md)
- [External adapters](docs/adapters/external-adapters.md)
- [Plugin specification](doc/plugins/PLUGIN_SPEC.md)
- [Product definition](doc/PRODUCT.md)
- [V1 implementation spec](doc/SPEC-implementation.md)

## Roadmap

Available today:

- companies, goals, agents, org charts, issues, comments, approvals, budgets, and activity logs
- heartbeat execution with local CLI/session, process, HTTP, OpenClaw gateway, and external adapter support
- project and execution workspaces, runtime services, work products, attachments, and documents
- routines, skills, marketplace discovery, plugin setup, tool test console, and tool permissions
- company memory, meeting rooms, Research Lab, Outcome Center, and Ops Incident Center
- local trusted mode, authenticated/private mode, Docker, embedded PostgreSQL, and hosted Postgres options

Planned next:

- guided first-company bootstrap
- governed self-healing
- fleet-level monitoring
- enterprise autopilot controls
- external channel inbox
- governed agent config changes
- company template marketplace
- stronger enforced-outcome workflows
- cloud and desktop distribution options

See [ROADMAP.md](ROADMAP.md) for the full roadmap.

## Community and Contributing

PaperClaw is open source under the MIT license. Contributions are welcome, especially bug fixes, docs, adapters, plugins, examples, and tightly scoped product improvements.

Start with:

- [Contributing guide](CONTRIBUTING.md)
- [Development guide](doc/DEVELOPING.md)
- [Plugin authoring guide](doc/plugins/PLUGIN_AUTHORING_GUIDE.md)
- [Creating an adapter](docs/adapters/creating-an-adapter.md)

## License and Attribution

PaperClaw is maintained by KesarCloud and released under the MIT license.

This project is based on the structure of the MIT-licensed Paperclip AI open-source project. See [LICENSE](LICENSE) for copyright and license notices.
