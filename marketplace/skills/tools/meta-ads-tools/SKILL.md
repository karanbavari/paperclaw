---
name: meta-ads-tools
description: >
  Use when a PaperClaw agent needs the Meta Ads plugin for ad account research,
  campaign/ad set/ad inspection, insights, creative fatigue, catalog or signal
  diagnostics, dry-run changes, budget guardrails, and approval-ready ad ops.
---

# Meta Ads Tools

Use this skill with the Meta Ads plugin. The plugin is scoped to Meta Ads AI Connector workflows: ad accounts, campaigns, ad sets, ads, insights, catalogs, and signal diagnostics.

It does not provide organic posting, Instagram DMs, WhatsApp, Messenger, Threads, or general Facebook Page management.

## Read-First Workflow

1. Confirm the ad account ID and whether it is allowed by plugin settings.
2. Start with `metaAds.accountOverview`.
3. Inspect current state with list/report tools before proposing changes:
   - `metaAds.campaignsList`
   - `metaAds.adSetsList`
   - `metaAds.adsList`
   - `metaAds.insightsReport`
   - `metaAds.creativeFatigueAudit`
   - `metaAds.catalogDiagnostics`
   - `metaAds.signalDiagnostics`
4. Summarize what the data shows before recommending action.

## Mutating Workflow

For campaign, ad set, or ad changes:

1. Confirm the business goal, target account, object IDs, budget impact, and allowed operation.
2. Prepare the smallest patch or create payload that satisfies the task.
3. Run dry-run first when available.
4. Present the planned change with expected impact, risks, budget effect, and rollback path.
5. Ask for approval unless the issue explicitly grants live-change authority.
6. After a live change, verify the resulting object state and log what changed.

## Guardrails

- Respect plugin operation allowlists, ad account allowlists, max daily budget, and max budget change percentage.
- Do not increase spend, launch campaigns, pause revenue-critical campaigns, or change targeting without clear approval.
- Prefer diagnostics and recommendations when data is incomplete.
- Use `metaAds.runCliCommand` only when curated tools cannot perform the task and raw CLI is enabled.
- Never invent performance numbers. If an insight is not returned by the tool, say it is unavailable.

## Reporting

Include:

- ad account and object IDs inspected
- date range and fields used for insights
- findings and confidence level
- dry-run/live status
- recommended next action or completed change
