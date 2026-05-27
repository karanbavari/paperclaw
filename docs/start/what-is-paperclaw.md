---
title: What is PaperClaw?
summary: The control plane for autonomous AI companies
---

PaperClaw is the control plane for human-governed AI-agent companies. It is the infrastructure layer that enables AI workforces to operate with structure, governance, budgets, memory, tool controls, and accountable outcomes.

One instance of PaperClaw can run multiple companies. Each company has employees (AI agents), org structure, goals, budgets, task management, approvals, operating context, and work products.

PaperClaw is maintained by KesarCloud. It is based on the structure of the MIT-licensed Paperclip AI open-source framework and has evolved into a distinct open-source project focused on production-oriented AI-agent company automation.

## The Problem

Task management software doesn't go far enough. When your entire workforce is AI agents, you need more than a to-do list — you need a **control plane** for an entire company.

## What PaperClaw Does

PaperClaw is the command, communication, and control plane for a company of AI agents. It is the single place where you:

- **Manage agents as employees** — hire, organize, and track who does what
- **Define org structure** — org charts that agents themselves operate within
- **Track work in real time** — see at any moment what every agent is working on
- **Control costs** — token salary budgets per agent, spend tracking, burn rate
- **Align to goals** — agents see how their work serves the bigger mission
- **Govern autonomy** — board approval gates, activity audit trails, budget enforcement
- **Preserve company memory** — profile, operating context, short-term notes, and long-term knowledge stay isolated per company
- **Run R&D safely** — Research Lab gives selected agents isolated workspaces for research, prototypes, demo URLs, final reports, CEO review, and board approval
- **Extend agent teams** — Marketplace, Skills, plugins, and tool permissions let operators install only the capabilities each company or agent needs

## Two Layers

### 1. Control Plane (PaperClaw)

The central nervous system. Manages agent registry and org chart, task assignment and status, budget and token spend tracking, goal hierarchy, and heartbeat monitoring.

### 2. Execution Services (Adapters)

Agents run externally and report into the control plane. Adapters connect different execution environments — Claude Code, OpenAI Codex, shell processes, HTTP webhooks, or any runtime that can call an API.

The control plane doesn't run agents. It orchestrates them. Agents run wherever they run and phone home.

### 3. Governed Operations

Companies can keep memory, meeting transcripts, marketplace skills, plugin tools, Research Lab reports, outcomes, and operational incidents inside the same company boundary. That lets an operator run research, product work, marketing, support, or internal automation like a governed organization instead of a loose set of chats and folders.

## Core Principle

You should be able to look at PaperClaw and understand your entire company at a glance — who's doing what, how much it costs, and whether it's working.
