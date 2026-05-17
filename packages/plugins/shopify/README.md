# @kesarcloud/plugin-shopify

First-party PaperClaw plugin that gives agents a governed Shopify Admin GraphQL tool surface.

## Setup

1. Create a Shopify public or custom app.
2. Configure the app callback URL as:

   ```text
   https://YOUR-PAPERCLAW-HOST/api/plugins/paperclaw.shopify/api/oauth/callback
   ```

3. Store the Shopify app client secret in PaperClaw secrets.
4. Configure the plugin with:
   - Shopify app API key
   - Shopify app secret reference
   - Admin API version, default `2026-04`
   - requested OAuth scopes
5. Open the OAuth start route for each store:

   ```text
   /api/plugins/paperclaw.shopify/api/oauth/start?companyId=COMPANY_ID&shop=STORE.myshopify.com
   ```

The OAuth callback stores the shop access token as a plugin-owned company secret. Agents never see the raw token.

## Agent Tools

- Shop overview
- Product search/get/create/update
- Inventory levels/adjustments
- Order search/get
- Collection search
- Page create/update
- Webhook subscription list/create
- Raw Admin GraphQL, disabled by default

Mutating tools run in dry-run mode by default and respect operation allowlists, shop allowlists, and inventory adjustment limits.
