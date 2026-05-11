# Playwright MCP Browser Automation Plugin

First-party PaperClaw plugin that exposes official Microsoft Playwright MCP browser automation tools to agents.

## What Agents Can Do

Agents can navigate pages, read accessibility snapshots, click/type/fill forms, take screenshots, manage tabs and dialogs, inspect console and network requests, mock network calls, manage browser storage, generate locators, run assertions, record traces/video, export PDFs, and use coordinate mouse tools for vision workflows.

The plugin starts Playwright MCP through stdio using:

```sh
npx -y @playwright/mcp@latest --headless --caps=network,storage,testing,vision,pdf,devtools,config
```

## Setup

1. Install this plugin from the PaperClaw Marketplace.
2. Ensure Node/npm can run `npx @playwright/mcp@latest`.
3. If browser binaries are missing, install Playwright browsers on the PaperClaw host.
4. Configure allowed or blocked origins if agents should be limited to specific sites.

## Safety

- Browser runs headless by default.
- Tool calls are audited in PaperClaw activity logs and plugin state.
- Output is truncated before returning to agents.
- Operators can configure allowed and blocked origins through Playwright MCP options.
