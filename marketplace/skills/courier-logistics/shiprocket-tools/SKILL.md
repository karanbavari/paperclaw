# Shiprocket Tools

Use this skill when a PaperClaw agent needs Indian ecommerce logistics workflows through the Shiprocket plugin.

## Protocol

1. Confirm Shiprocket token setup is complete.
2. Use courier/serviceability tools before order or AWB creation.
3. Use `shiprocket.trackingLookup` for AWB status.
4. Keep order creation, AWB label generation, and pickup scheduling in dry-run until approved.

## Guardrails

- Never expose Shiprocket tokens.
- Verify courier, charge, pickup address, delivery address, payment mode, and parcel weight before live operations.
- Keep customer data minimal in comments.
