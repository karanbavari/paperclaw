# USPS Tools

Use this skill when a PaperClaw agent needs USPS workflows through the USPS plugin.

## Protocol

1. Confirm USPS OAuth credentials are configured.
2. Use `usps.addressValidate` before label work.
3. Use `usps.rateQuote` to compare services.
4. Keep label and carrier pickup tools in dry-run until live execution is approved.

## Guardrails

- Never expose USPS credentials.
- Verify address and service details before live labels.
- Summarize tracking events concisely.
