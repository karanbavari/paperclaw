# Meta Ads Plugin

First-party PaperClaw plugin for Meta Ads AI Connector workflows.

## What Agents Can Access

The plugin is scoped to Meta's Ads AI Connector surface. In practice, that means agents can work with Meta ad accounts, campaigns, ad sets, ads, insights, catalogs, and signal diagnostics exposed by the authenticated CLI profile.

It does not give agents organic social posting, Instagram DMs, WhatsApp messaging, Messenger, Threads, or general Facebook Page management tools.

## Tools

- `metaAds.accountOverview`
- `metaAds.campaignsList`
- `metaAds.campaignCreate`
- `metaAds.campaignUpdate`
- `metaAds.adSetsList`
- `metaAds.adSetUpdate`
- `metaAds.adsList`
- `metaAds.adUpdate`
- `metaAds.insightsReport`
- `metaAds.creativeFatigueAudit`
- `metaAds.catalogList`
- `metaAds.catalogDiagnostics`
- `metaAds.signalDiagnostics`
- `metaAds.runCliCommand`

## Setup

1. Install Meta's official Ads AI Connector CLI.
2. Authenticate it with the Meta Business account that owns the ad accounts agents should use.
3. Install this plugin from the PaperClaw Marketplace.
4. Configure `metaCliBinaryPath`, optional `metaConfigDir`, ad account allowlist, and budget guards.
5. Keep `dryRun` enabled until the operator verifies command output.

The raw CLI tool is disabled by default. If enabled, agents must pass a structured argument array rather than a shell command string.

## Safety

Mutating tools are guarded by:

- dry-run mode by default
- operation allowlist
- optional ad account allowlist
- max daily budget cents
- max budget change percentage
- command timeout and output truncation
- PaperClaw activity log and plugin-state command audit
