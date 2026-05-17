# ShipEngine Tools

Use this skill when a PaperClaw agent needs to inspect or operate ShipEngine through the ShipEngine plugin.

## Protocol

1. Confirm the ShipEngine API key secret reference is configured.
2. Use `shipengine.carrierServices` and `shipengine.rateQuote` before labels.
3. Use `shipengine.addressValidate` before shipping to a new address.
4. Keep `shipengine.labelCreate` in dry-run until live purchase is approved.

## Guardrails

- Never expose ShipEngine API keys.
- Summarize rates and tracking instead of dumping raw payloads.
- Stop on missing carrier/service permissions.
