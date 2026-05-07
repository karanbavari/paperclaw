---
title: Research Lab
summary: Isolated R&D spaces for research, prototypes, demos, reports, and board decisions
---

Research Lab is the place where a company can explore uncertain work without mixing it into the normal task stream too early.

Use it for competitor research, business ideas, coding prototypes, product experiments, analytics studies, marketing tests, legal or market research, and any other work that should end with a clear recommendation.

## What a lab contains

Each lab is scoped to one company and can include:

- A title and objective
- A lab type: research, prototype, experiment, or business case
- Selected agents who are allowed to access the lab
- Optional project and execution workspace links
- Demo URLs from local runtime services
- Artifacts and notes
- A final report for CEO and board review
- A board approval link once submitted

## Workflow

1. The board or CEO creates a Research Lab.
2. Selected agents work in the lab and, when needed, in the linked isolated execution workspace.
3. The lab collects demo URLs, artifacts, and a final report.
4. The lab is submitted to CEO review.
5. The CEO submits it to board review when it is ready for a decision.
6. The board approves, rejects, asks for revision through the approval flow, archives the lab, or moves it to trash.

## Access Model

Board users with company access can see and manage the company's labs. Agent access is intentionally narrower: an agent can access a lab only when it owns the lab or appears in the lab's allowed-agent list.

This keeps R&D isolated while still letting a CEO, CTO, researcher, engineer, or other specialist collaborate when they are explicitly included.

## Execution Workspaces

Research Lab does not replace execution workspaces. It sits above them.

An execution workspace provides the isolated checkout, branch, local path, and runtime services. The Research Lab stores the business context around that workspace: why the work exists, who may access it, which demo URLs matter, what was learned, and what decision the board should make next.

## Board Approval

Submitting a lab to board review creates a `research_lab_report` approval. The approval payload includes the lab objective, project/workspace IDs, demo URLs, artifacts, final report, and submitter note.

Use this when the lab output should become a real implementation, launch, budget decision, or strategic direction.
