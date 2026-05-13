# Roadmap

This document expands the roadmap preview in `README.md`.

PaperClaw is still moving quickly. The list below is directional, not promised, and priorities may shift as we learn from users and from operating real AI companies with the product.

We value community involvement and want to make sure contributor energy goes toward areas where it can land.

We may accept contributions in the areas below, but if you want to work on roadmap-level core features, please coordinate with us first in Discord (`#dev`) before writing code. Bugs, docs, polish, and tightly scoped improvements are still the easiest contributions to merge.

If you want to extend PaperClaw today, the best path is often the [plugin system](doc/plugins/PLUGIN_SPEC.md). Community reference implementations are also useful feedback even when they are not merged directly into core.

## Milestones

### ✅ Plugin system

PaperClaw should keep a thin core and rich edges. Plugins are the path for optional capabilities like knowledge bases, custom tracing, queues, doc editors, and other product-specific surfaces that do not need to live in the control plane itself.

### ✅ Get OpenClaw / claw-style agent employees

PaperClaw should be able to hire and manage real claw-style agent workers, not just a narrow built-in runtime. This is part of the larger "bring your own agent" story and keeps the control plane useful across different agent ecosystems.

### ✅ companies.sh - import and export entire organizations

Reusable companies matter. Import/export is the foundation for moving org structures, agent definitions, and reusable company setups between environments and eventually for broader company-template distribution.

### ✅ Easy AGENTS.md configurations

Agent setup should feel repo-native and legible. Simple `AGENTS.md`-style configuration lowers the barrier to getting an agent team running and makes it easier for contributors to understand how a company is wired together.

### ✅ Skills Manager

Agents need a practical way to discover, install, and use skills without every setup becoming bespoke. The skills layer is part of making PaperClaw companies more reusable and easier to operate.

### ✅ Scheduled Routines

Recurring work should be native. Routine tasks like reports, reviews, and other periodic work need first-class scheduling so the company keeps operating even when no human is manually kicking work off.

### ✅ Better Budgeting

Budgets are a core control-plane feature, not an afterthought. Better budgeting means clearer spend visibility, safer hard stops, and better operator control over how autonomy turns into real cost.

### ✅ Agent Reviews and Approvals

PaperClaw should support explicit review and approval stages as first-class workflow steps, not just ad hoc comments. That means reviewer routing, approval gates, change requests, and durable audit trails that fit the same task model as the rest of the control plane.

### ✅ Multiple Human Users

PaperClaw needs a clearer path from solo operator to real human teams. That means shared board access, safer collaboration, and a better model for several humans supervising the same autonomous company.

### ✅ Meeting Rooms

Meeting Rooms give the board a group-chat style coordination surface where selected agents can discuss a topic, answer direct questions, delegate to other agents, and preserve the meeting transcript as durable company history.

### ✅ Company Memory / Knowledge

Companies now have isolated profile and memory surfaces. Operators can store company identity, registration details, business category, contact context, language, currency, timezone, short-term notes, and long-term knowledge so agents can recall the right context without mixing companies.

### ✅ Skills Marketplace

The marketplace separates skill discovery from local installation. Operators and approved CEO agents can browse remote skills, search/filter by category, preview details, and install only the skills a company or selected agents need, with board approval controls where required.

### ✅ Research Lab

Research Lab is the governed R&D workspace for a company. It connects isolated execution workspaces, selected agent access, demo URLs, final reports, CEO review, and board approval so research, competitor analysis, prototypes, and launch recommendations can move from exploration to decision.

### ✅ Company language, currency, and timezone preferences

Company settings now include default language, currency, and timezone. Managed agent instructions sync those preferences so conversations, reports, and task outputs use the company's chosen operating context.

### ✅ Capability Packs

Capability Packs now bundle marketplace plugin and skill components, setup checklist state, install status, and recommended or selected agent assignment into one install flow.

### ✅ Plugin Setup Wizard

Plugin installation can continue into a company-scoped setup wizard for config, local folders, health, tools, jobs, webhooks, database review, managed resources, progress state, and completion tracking.

### ✅ Plugin Tool Test Console

Operators can inspect installed plugin tools, view parameter schemas, execute audited board-console test runs, inspect structured results, and see recent failures from the plugin detail page.

### ✅ Tool Permission System

Powerful tools now have clear controls. PaperClaw supports company defaults, company tool rules, per-agent overrides, approval-required execution, budget-limited usage, deny rules, sanitized tool-execution approvals, and audit records for plugin-contributed tools.

### ✅ Outcome Center

The board now has a single place to answer "what shipped?" Outcome Center aggregates issue work products such as PRs, previews, artifacts, documents, commits, branches, and runtime-service links across issues and projects.

### ⚪ Ops Incident Center

Operational failures should be visible without digging through separate pages. Ops Incident Center should consolidate stuck runs, watchdog decisions, budget incidents, plugin failures, environment errors, and recovery actions into one company health surface.

### ⚪ Guided First Company Bootstrap

The first-run experience should create real momentum quickly. A guided bootstrap should interview the operator, create a company, CEO, first goal, first task, and first successful run so new users reach value in minutes.

### ⚪ External Channel Inbox

Work should be able to enter PaperClaw from the places companies already communicate. Email, Slack, WhatsApp, support tickets, and webhooks should become governed issues or comments instead of disconnected messages.

### ⚪ Governed Agent Config Changes

Risky agent changes should have the same governance quality as work execution. Adapter config, runtime config, permissions, budgets, and default environment changes should support diff review, approval gates, and rollback.

### ⚪ Company Template Marketplace

Company templates should eventually go beyond import/export into installable blueprints with org charts, agents, skills, routines, budgets, and governance defaults. This is the path toward reusable "AI company starter packs."

### ⚪ Artifacts & Work Products

PaperClaw should make outputs first-class. That means generated artifacts, previews, deployable outputs, and the handoff from "agent did work" to "here is the result" should become more visible and easier to operate.

### ⚪ Enforced Outcomes

PaperClaw should get stricter about what counts as finished work. Tasks, approvals, and execution flows should resolve to clear outcomes like merged code, published artifacts, shipped docs, or explicit decisions instead of stopping at vague status updates.

### ⚪ MAXIMIZER MODE

This is the direction for higher-autonomy execution: more aggressive delegation, deeper follow-through, and stronger operating loops with clear budgets, visibility, and governance. The point is not hidden autonomy; the point is more output per human supervisor.

### ⚪ Deep Planning

Some work needs more than a task description before execution starts. Deeper planning means stronger issue documents, revisionable plans, and clearer review loops for strategy-heavy work before agents begin execution.

### ⚪ Work Queues

PaperClaw should support queue-style work streams for repeatable inputs like support, triage, review, and backlog intake. That would make it easier to route work continuously without turning every system into a one-off workflow.

### ⚪ Self-Organization

As companies grow, agents should be able to propose useful structural changes such as role adjustments, delegation changes, and new recurring routines. The goal is adaptive organizations that still stay within governance and approval boundaries.

### ⚪ Automatic Organizational Learning

PaperClaw should get better at turning completed work into reusable organizational knowledge. That includes capturing playbooks, recurring fixes, and decision patterns so future work starts from what the company has already learned.

### ⚪ CEO Chat

We want a lighter-weight way to talk to leadership agents, but those conversations should still resolve to real work objects like plans, issues, approvals, or decisions. This should improve interaction without changing the core task-and-comments model.

### ⚪ Cloud deployments

Local-first remains important, but PaperClaw also needs a cleaner shared deployment story. Teams should be able to run the same product in hosted or semi-hosted environments without changing the mental model.

### ⚪ Desktop App

A desktop app can make PaperClaw feel more accessible and persistent for day-to-day operators. The goal is easier access, better local ergonomics, and a smoother default experience for users who want the control plane always close at hand.
