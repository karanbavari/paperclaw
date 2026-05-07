# PaperClaw AI Company Tools Research Report

Date: 2026-05-07

Reference projects studied:

- `hermes agent/` from NousResearch Hermes Agent
- `openclaw/` from OpenClaw
- `opencode/` from OpenCode

## Executive Summary

PaperClaw ka strongest direction ye hai ki ise ek **AI company control plane** banaya jaye, na ki ek single AI runtime ya OpenCode/Claude/Codex wrapper. Current PaperClaw already companies, agents, org chart, issues, heartbeats, budgets, approvals, plugins, skills, routines, and adapters provide karta hai. Missing layer hai: **business tools, governed tool permissions, memory/knowledge, external channels, and typed run visibility**.

Recommendation clear hai:

- Adapter structure keep karo.
- OpenCode, Claude, Codex, Hermes, OpenClaw jaise runtimes ko pluggable execution engines rakho.
- CRM, email SMTP, WhatsApp Cloud API, calendars, billing, support desk, spreadsheets, databases, and SaaS tools ko **PaperClaw tool plugins** ke through expose karo.
- Har tool call company-scoped, agent-scoped, permission-checked, audited, and optionally board-approved hona chahiye.
- Agents ko sirf CLI tools nahi, balki business tools, memory, knowledge, communication channels, and workflow automations milne chahiye.

Simple product statement:

> PaperClaw should become the operating system for an AI company: agents work 24x7, use approved business tools, remember company knowledge, communicate through real channels, and remain governed by the board.

## Current PaperClaw Baseline

PaperClaw me already strong foundation hai:

- AI employees with roles, reporting lines, budgets, status, and permissions.
- Adapter-based runtime model for OpenCode, Claude, Codex, Gemini, Pi, Cursor, Hermes, OpenClaw gateway, process, and HTTP.
- Heartbeat system for autonomous work.
- Issues, comments, documents, approvals, routines, workspaces, activity logs, and cost tracking.
- Plugin system with capabilities, jobs, webhooks, UI slots, managed agents, managed routines, local folders, and agent tool declarations.
- Company skills and runtime skill sync.
- MCP server exposing PaperClaw APIs as tools.

Important gap:

PaperClaw can run agents, but it does not yet provide a complete **business tool platform** where every employee can use CRM, email, WhatsApp, billing, support, calendar, documents, databases, and internal knowledge in a governed way.

## Reference Project Findings

### Hermes Agent

Hermes is a full Python agent runtime. It has CLI, gateway, ACP/editor adapter, API server, batch runner, cron, dashboard, provider routing, tool dispatch, memory, skills, and compression.

Best ideas for PaperClaw:

- **Bounded curated memory** using files like `MEMORY.md` and `USER.md`.
- **Session search** using SQLite and FTS over previous conversations, with summaries.
- **Progressive skills system** where skills are discoverable by metadata and loaded only when needed.
- **Toolsets** for web, terminal, files, browser, cron, messaging, memory, delegation, etc.
- **Subagent delegation** with isolated context and restricted tools.
- **Kanban-like worker tools** for structured task handoff.
- **Checkpoint-backed rollback** before risky file operations.
- **OpenAI-compatible API server** with health, capabilities, streaming, cancellation, and run APIs.

What PaperClaw should not copy:

- Hermes has its own task board and execution plane. PaperClaw already has a stronger company-scoped issue/governance model, so Hermes-style kanban should inspire structured handoff tools, not replace PaperClaw issues.

### OpenClaw

OpenClaw is a local-first assistant gateway. One daemon owns channels, sessions, tools, nodes, plugins, memory, and a web control UI.

Best ideas for PaperClaw:

- **Gateway model** for channels and clients.
- **Multi-channel inbox**: WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Matrix, Teams, Google Chat, etc.
- **Per-agent/persona workspaces** with files like `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `USER.md`, and `BOOTSTRAP.md`.
- **Tool profiles** like full, coding, messaging, minimal, with allow/deny lists.
- **Active memory**: a bounded pre-run recall pass before the main agent replies or acts.
- **Memory Wiki**: durable knowledge with evidence, freshness, contradictions, and dashboards.
- **Sandbox modes** for safer non-main sessions.
- **Pairing/security model** for remote devices and inbound DMs.
- **Live tool cards** and event-rich gateway UI.

What PaperClaw should not copy:

- OpenClaw is mainly a personal assistant. PaperClaw should stay company-first: org chart, board governance, goals, departments, agents, projects, tasks, budgets, and audit trail.

### OpenCode

OpenCode is an open-source AI coding agent with a client/server architecture. It exposes project, session, file, MCP, provider, permission, PTY, sync, and workspace APIs.

Best ideas for PaperClaw:

- **Typed run event model** instead of raw logs only.
- **Message parts** for text, reasoning, file references, tool calls, patches, snapshots, retries, subtasks, and compactions.
- **Permission model** with allow, ask, deny, and always-style decisions.
- **Built-in specialist modes** like build, plan, general, explore, summary, and compaction.
- **MCP manager** for tools, prompts, resources, OAuth, and dynamic refresh.
- **Snapshot/diff artifacts** for coding sessions.
- **Provider-agnostic model routing** and auth handling.
- **Context pressure UI** showing compaction and retained summaries.

What PaperClaw should not copy:

- OpenCode is coding-session-first. PaperClaw needs business-process-first orchestration. Borrow the typed event stream, permission model, MCP manager, and snapshots, not the whole coding chat product.

## Comparison Matrix

| Area | Hermes | OpenClaw | OpenCode | PaperClaw Direction |
| --- | --- | --- | --- | --- |
| Core identity | Personal/self-improving agent runtime | Local-first personal assistant gateway | Coding agent runtime/server | AI company control plane |
| Tool model | Toolsets and MCP | Plugin tools and tool profiles | Built-in/plugin/MCP tools with permissions | Company-scoped tool registry with governance |
| Memory | Curated files, session search, skills | Active memory, memory wiki, dreaming | Session todo, compaction, rich history | Company/agent/project/issue memory providers |
| Channels | Messaging gateway | Very broad channel gateway | Mostly clients/UI/API | Business communication gateway |
| Permissions | Toolsets and runtime checks | Tool profiles, sandbox, pairing | allow/ask/deny permission queue | Board-governed tool policies |
| Runtime visibility | Tool cards, logs, dashboard | Gateway events and UI cards | Typed run parts/events | Typed heartbeat/run timeline |
| Best fit for PaperClaw | Memory, skills, API bridge | Channels, active memory, tool profiles | Permissions, typed events, MCP, snapshots | Combine all under company governance |

## Strategic Recommendation

PaperClaw should become a **governed business automation platform**.

The correct architecture is:

1. **PaperClaw Core**
   - Owns companies, agents, org chart, issues, goals, projects, routines, approvals, budgets, audit, and permissions.

2. **Adapter Layer**
   - Owns execution runtime integration: OpenCode, Claude, Codex, Hermes, OpenClaw, Gemini, Pi, Cursor, custom HTTP/process.

3. **Tool Plugin Layer**
   - Owns external business tools: CRM, SMTP/email, WhatsApp Cloud API, Slack, calendars, billing, databases, docs, support desk, webhooks.

4. **Memory Provider Layer**
   - Owns memory storage/retrieval: local markdown, FTS search, vector DB, hosted memory APIs, company knowledge wiki.

5. **Channel Gateway Layer**
   - Owns inbound/outbound communication: customers, operators, teams, and agents across WhatsApp/email/Slack/etc.

This keeps PaperClaw flexible and future-proof.

## Feature Recommendations

### 1. Company Tool Registry

PaperClaw needs a first-class registry of tools available to agents.

Examples:

- CRM tools: `crm.searchLead`, `crm.updateDeal`, `crm.createFollowupTask`
- Email tools: `email.send`, `email.searchInbox`, `email.reply`, `email.createDraft`
- WhatsApp tools: `whatsapp.sendMessage`, `whatsapp.replyToThread`, `whatsapp.markResolved`
- Calendar tools: `calendar.createEvent`, `calendar.findAvailability`
- Billing tools: `stripe.getCustomer`, `stripe.createInvoice`, `stripe.checkPayment`
- Support tools: `support.searchTicket`, `support.replyTicket`, `support.escalate`
- Knowledge tools: `knowledge.search`, `knowledge.add`, `knowledge.correct`

Each tool should have:

- Stable name
- Human label
- Description for agents
- JSON schema input
- JSON schema output or typed result envelope
- Owning plugin
- Required scopes
- Risk level
- Audit policy
- Approval policy

### 2. Tool Permissions and Governance

PaperClaw should adopt a permission vocabulary inspired by OpenCode and OpenClaw:

- `allow`: agent can call without approval.
- `ask`: board/user approval required before execution.
- `deny`: agent cannot call.
- `always`: operator approved this class of action for a scope.

Policies should be scoped by:

- Company
- Agent
- Role
- Department
- Project
- Issue
- Tool
- Risk level
- Environment

Example:

- Sales Agent can read CRM leads.
- Sales Agent can draft email.
- Sales Agent needs approval to send bulk campaigns.
- Finance Agent can read invoices.
- Finance Agent needs approval to issue refunds.
- Support Agent can reply on WhatsApp within policy.
- Any agent needs approval before deleting records or sending payment links.

### 3. Business Connector Plugins

Business tools should be delivered as plugins, not hardcoded into core.

Initial plugin priorities:

1. SMTP/Email plugin
   - Send email, reply, search inbox, create drafts.

2. WhatsApp Cloud API plugin
   - Send messages, receive webhooks, map conversations to issues.

3. CRM starter plugin
   - Generic CRM abstraction first, then HubSpot/Pipedrive/Zoho/Salesforce adapters.

4. Google Workspace plugin
   - Gmail, Calendar, Drive, Docs, Sheets.

5. Slack/Discord operator plugin
   - Board notifications, approvals, agent mentions, run summaries.

6. Stripe/Billing plugin
   - Customers, subscriptions, invoices, payment status.

7. Support desk plugin
   - Tickets, customer replies, SLA routines, escalation.

### 4. Memory and Knowledge Layer

PaperClaw needs memory at multiple scopes:

- Company memory: global policies, strategy, customers, brand voice.
- Department memory: sales playbooks, engineering standards, support SOPs.
- Agent memory: personal working style, repeated tasks, role knowledge.
- Project memory: architecture, decisions, constraints, roadmap.
- Issue memory: important history, blockers, decisions, artifacts.
- Customer/account memory: CRM-style context and interaction history.

Minimum memory provider contract:

- `ingest`
- `search`
- `inspect`
- `correct`
- `forget`
- `assembleContext`

Every memory item should preserve provenance:

- Source issue/comment/document/run
- Author agent/user
- Timestamp
- Confidence
- Freshness
- Business object link
- Provider-native ID

Borrow from:

- Hermes: session search and curated memory.
- OpenClaw: active memory and memory wiki.
- OpenCode: compaction summaries and typed session history.

### 5. Active Recall Before Runs

Before each agent heartbeat, PaperClaw should run a bounded memory recall step.

Input:

- Agent role
- Current issue
- Project
- Company goals
- Recent comments
- Tool policies

Output:

- Short context bundle
- Relevant memories
- Relevant documents
- Previous decisions
- Known risks
- Customer/account context

This should be logged as a run event, so the board can see what context the agent used.

### 6. Typed Run Timeline

PaperClaw should move from logs-first visibility to event-first visibility.

Run events should include:

- `run.started`
- `memory.recalled`
- `assistant.message`
- `tool.requested`
- `tool.approval_requested`
- `tool.approved`
- `tool.denied`
- `tool.started`
- `tool.completed`
- `tool.failed`
- `artifact.created`
- `issue.updated`
- `cost.recorded`
- `context.compacted`
- `run.blocked`
- `run.completed`

UI should show:

- Timeline
- Tool cards
- Cost cards
- Approval cards
- Memory recall cards
- Artifact cards
- Error/retry cards

This is one of the biggest upgrades for trust.

### 7. MCP Manager

PaperClaw should expose MCP servers as company/project/agent-level integrations.

MCP manager should show:

- Server name
- Transport
- Auth status
- Tools
- Prompts
- Resources
- Last refresh
- Health
- Which agents can use it
- Approval policy

This makes external tools easier to connect without writing custom adapters every time.

### 8. Agent Execution Lanes

Inspired by OpenCode agents, each PaperClaw employee should support named execution lanes:

- `plan`: read-only analysis, low risk
- `build`: full execution
- `research`: web/search/tools heavy
- `support`: customer communication tools
- `sales`: CRM/email/WhatsApp tools
- `finance`: billing/invoice tools
- `review`: approval/review mode
- `summary`: cheap summarization model
- `compaction`: context compression

Each lane can define:

- Model
- Prompt
- Tool profile
- Permission policy
- Budget limit
- Max steps
- Approval behavior

### 9. Role-Based Tool Profiles

Default profiles should make onboarding easy.

Example profiles:

- CEO: strategy, read all dashboards, approve high-risk actions, create initiatives.
- CTO: code/workspace/GitHub/tools, deployment status, architecture knowledge.
- Sales Agent: CRM, email drafts, WhatsApp followups, calendar booking.
- Support Agent: ticketing, WhatsApp replies, knowledge base, escalation.
- Marketing Agent: campaign drafts, analytics, social tools, email drafts.
- Finance Agent: billing read, invoice draft, payment status, refund approval request.
- HR Agent: candidate CRM, email scheduling, documents, approvals.

These are defaults; board can override per company.

### 10. Channel Gateway

PaperClaw should eventually support customer/operator communication channels.

Inbound:

- WhatsApp messages
- Emails
- Slack/Discord mentions
- Website chat
- CRM webhooks
- Support tickets

Outbound:

- Agent replies
- Drafts for approval
- Followups
- Notifications
- Escalations

Important rule:

Inbound external messages should become PaperClaw objects: issues, comments, customer threads, or routine events. They should not bypass governance.

### 11. Snapshot and Rollback for Workspaces

For coding agents:

- Create checkpoint before risky changes.
- Store patch summary.
- Attach changed files to issue.
- Allow board to inspect/revert.

This idea comes strongly from OpenCode snapshots and Hermes shadow-git checkpoints.

### 12. Routines as Business Automation

PaperClaw routines should become business automation triggers:

- Every morning: Sales Agent checks CRM stale leads.
- Every hour: Support Agent checks unresolved WhatsApp tickets.
- Every day: Finance Agent checks failed payments.
- Every week: CEO gets business health report.
- On webhook: WhatsApp customer issue creates support issue.
- On invoice overdue: Finance Agent sends approved reminder.

Routines should be visible, auditable, and cancellable.

## Core vs Plugin Boundary

### Keep In Core

- Companies
- Agents
- Roles and reporting lines
- Issues/tasks/comments/documents
- Goals/projects
- Heartbeats
- Approvals
- Budgets
- Activity/audit logs
- Tool registry abstraction
- Tool permission policy engine
- Memory provider abstraction
- Typed run event schema
- Plugin runtime
- Security/governance

### Keep In Plugins

- CRM-specific APIs
- SMTP/Gmail/Outlook
- WhatsApp Cloud API
- Slack/Discord/Telegram channels
- Stripe/Razorpay
- HubSpot/Pipedrive/Salesforce/Zoho
- Google Calendar/Drive/Sheets
- Support desks
- Databases and warehouses
- Industry-specific tools
- Custom business workflows

### Keep In Adapters

- OpenCode
- Claude Code
- Codex
- Hermes
- OpenClaw Gateway
- Gemini
- Pi
- Cursor
- Custom HTTP/process agents

## Example Business Workflows

### CRM Lead Followup

1. Routine finds leads not contacted in 3 days.
2. Sales Agent uses CRM tool to read lead details.
3. Active memory injects previous conversation and company sales playbook.
4. Sales Agent drafts email and WhatsApp followup.
5. Policy requires approval for first outbound customer message.
6. Board approves.
7. Agent sends message.
8. CRM activity is updated.
9. PaperClaw logs every action.

### WhatsApp Support Reply

1. Customer sends WhatsApp message.
2. WhatsApp plugin receives webhook.
3. PaperClaw creates or updates a support issue.
4. Support Agent wakes.
5. Agent searches knowledge base and customer memory.
6. If confidence is high, agent replies.
7. If confidence is low, agent asks Support Lead or board.
8. Thread and resolution are stored in company knowledge.

### Invoice Payment Workflow

1. Finance routine checks overdue invoices.
2. Finance Agent reads billing provider and CRM.
3. Agent drafts reminder.
4. Sending payment reminder is allowed, but refund or write-off requires approval.
5. Agent sends reminder after policy check.
6. If customer replies, issue continues.
7. CEO dashboard shows overdue amount and agent action history.

### Engineering Deployment Workflow

1. CTO creates release issue.
2. Engineer agent works in workspace with snapshot enabled.
3. Tool timeline records shell, tests, file diffs, and costs.
4. QA agent reviews artifact.
5. Approval gate asks board before deploy.
6. Deployment plugin performs deploy after approval.
7. Incident routine monitors health.

## Prioritized Roadmap

### Phase 1: Tool Registry and Permission Engine

Build the minimum foundation:

- Tool registry table/API.
- Plugin-declared tools surfaced to agents.
- Agent/company/project tool policies.
- Tool call audit logs.
- Permission states: allow, ask, deny, always.
- Board approval flow for risky tools.

Success criteria:

- A plugin can register a tool.
- An agent can call the tool through PaperClaw.
- PaperClaw can block or ask approval.
- Every call is visible in audit history.

### Phase 2: First Business Connectors

Build starter plugins:

- SMTP/email
- WhatsApp Cloud API
- Generic CRM or HubSpot starter

Success criteria:

- Sales/support agents can use real communication tools.
- Incoming WhatsApp/email can create/update issues.
- Outbound messages can require approval.

### Phase 3: Memory and Knowledge

Build memory provider abstraction:

- Local FTS/markdown baseline.
- Company/agent/project/issue scopes.
- Active recall before runs.
- Knowledge vault UI.
- Provenance and correction.

Success criteria:

- Agent receives relevant memory before work.
- Board can inspect why memory was used.
- Knowledge can be corrected or forgotten.

### Phase 4: Typed Run Timeline

Upgrade run visibility:

- Store typed run events.
- Render tool cards and approval cards.
- Show cost per step.
- Show memory recall.
- Show artifacts and patches.

Success criteria:

- Board can understand an agent run without reading raw logs.
- Tool calls and business actions are explainable.

### Phase 5: MCP Manager

Add MCP as a first-class integration surface:

- Register MCP servers.
- Show tools/prompts/resources.
- Manage auth and health.
- Assign MCP tools to agents.
- Apply PaperClaw permission policy.

Success criteria:

- External MCP servers become governed company tools.

### Phase 6: Channel Gateway

Add communication channel layer:

- WhatsApp, email, Slack/Discord first.
- Inbound messages map to issues/comments.
- Outbound replies go through approval policies.
- Operator notifications and approvals through channels.

Success criteria:

- PaperClaw agents can run support/sales workflows end-to-end.

### Phase 7: Company Templates and Tool Packs

Create reusable AI company packages:

- Sales company
- Support company
- SaaS operations company
- Content/marketing company
- Engineering/product company

Each includes:

- Agents
- Roles
- Tool profiles
- Skills
- Routines
- Memory templates
- Connector setup checklist

## Security and Governance

External tools are powerful and risky. PaperClaw should treat them as governed business actions.

Security rules:

- Secrets never go into prompts.
- Tools receive secrets server-side only.
- Agents see tool descriptions, not raw credentials.
- High-risk operations require approval.
- Every external action has an audit event.
- Tool outputs are summarized/redacted when needed.
- Customer data is scoped by company.
- Plugin capabilities must be explicit.
- Inbound messages are untrusted input.
- Destructive actions should support dry-run or confirmation.

Risk levels:

- Low: read-only search, list records, get status.
- Medium: create draft, update internal note, schedule calendar.
- High: send external message, update CRM stage, create invoice.
- Critical: delete data, issue refund, deploy production, send bulk campaign.

## Product UX Recommendations

### Agent Detail Page

Show:

- Runtime adapter
- Tool profile
- Available tools
- Denied tools
- Pending approvals
- Memory scope
- Active routines
- Cost/budget
- Recent tool calls
- Last run timeline

### Company Tools Page

Show:

- Installed connectors
- Available tools
- Health status
- Auth status
- Which agents can use each tool
- Risk/approval policy
- Recent tool activity

### Memory Page

Show:

- Company knowledge
- Project knowledge
- Agent memory
- Customer/account memory
- Freshness
- Contradictions
- Corrections
- Source provenance

### Run Timeline Page

Show:

- What the agent knew
- What tools it requested
- What was approved/denied
- What it changed
- What it spent
- What it produced
- Why it stopped

## Final Recommendation

PaperClaw should not become OpenCode, Hermes, or OpenClaw. It should become the **company layer above them**.

The winning model:

- OpenCode/Codex/Claude/Hermes/OpenClaw execute.
- PaperClaw governs.
- Plugins provide business tools.
- Memory providers provide knowledge.
- Routines keep work running 24x7.
- Board approvals keep risk controlled.
- Typed timelines make everything inspectable.

If this is built well, PaperClaw can run real businesses:

- Sales followups
- Customer support
- Marketing operations
- Finance reminders
- Engineering tasks
- Research workflows
- Internal reporting
- Cross-agent meetings and decisions

The next high-leverage build is **Tool Registry + Tool Permissions + first business connectors**. Without that, agents remain mostly coding/runtime workers. With it, they become actual AI employees.
