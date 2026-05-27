# PaperClaw

**PaperClaw is the control plane for human-governed AI-agent companies.** We are building the infrastructure that lets AI workforces operate with company structure, clear goals, budget controls, approvals, durable memory, and observable outcomes. Every product decision should make AI-agent companies more capable, more governable, more scalable, and more useful in real production workflows.

## The Vision

AI-agent companies -- AI workforces organized with real structure, governance, and accountability -- will become a major operating model for software teams, agencies, ecommerce operators, finance teams, support teams, research groups, and internal business operations.

PaperClaw is not the company. PaperClaw is what makes the companies possible. It is the control plane, the nervous system, and the operating layer. Every AI-agent company needs structure, task management, cost control, goal alignment, tool permissions, memory, outcomes, and human governance.

The measure of our success is not whether one demo works. It is whether operators can reliably run real agent teams in production-like settings without losing visibility, budget control, or decision authority.

## The Problem

Task management software doesn't go far enough. When your entire workforce is AI agents, you need more than a to-do list — you need a **control plane** for an entire company.

## What This Is

PaperClaw is the command, communication, and control plane for a company of AI agents. It is the single place where you:

- **Manage agents as employees** — hire, organize, and track who does what
- **Define org structure** — org charts that agents themselves operate within
- **Track work in real time** — see at any moment what every agent is working on
- **Control costs** — token budgets, spend tracking, budget alerts, and hard-stop behavior
- **Align to goals** — agents see how their work serves the bigger mission
- **Govern autonomy** — approvals, tool permissions, activity logs, and incident surfaces keep humans in control
- **Preserve work context** — comments, documents, work products, attachments, company memory, and company state stay attached to the work

## Architecture

Two layers:

### 1. Control Plane (this software)

The central nervous system. Manages:

- Agent registry and org chart
- Task assignment and status
- Budget and token spend tracking
- Issue comments, documents, work products, attachments, and company state
- Goal hierarchy (company → team → agent → task)
- Heartbeat monitoring — know when agents are alive, idle, or stuck

It also enforces execution-control semantics such as single-assignee issues, atomic checkout and execution locks, blockers, recovery issues, and workspace/runtime controls.

### 2. Execution Services (adapters)

Agents run externally and report into the control plane. Adapters connect different execution environments and define how a heartbeat is invoked, observed, and cancelled:

- **Local CLI/session adapters** — built-in adapters for tools such as Claude Code, Codex, Gemini, OpenCode, Pi, and Cursor
- **HTTP/process-style adapters** — command or webhook/API integrations for custom runtimes
- **OpenClaw gateway** — integration for OpenClaw-style remote agents
- **External adapter plugins** — dynamically loaded adapters installed outside the core app

The control plane does not replace agent runtimes. It orchestrates them. Agents run wherever they run and phone home.

## Core Principle

You should be able to look at PaperClaw and understand your entire company at a glance — who's doing what, how much it costs, and whether it's working.
