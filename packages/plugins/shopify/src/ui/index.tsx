import {
  useHostContext,
  usePluginData,
  type PluginPageProps,
  type PluginSettingsPageProps,
  type PluginWidgetProps,
} from "@kesarcloud/plugin-sdk/ui";
import { DATA_KEYS } from "../constants.js";

type StatusData = {
  configured: boolean;
  dryRun: boolean;
  rawEnabled: boolean;
  apiVersion: string;
  requestedScopes: string[];
  allowedOperations: string[];
  allowedShopDomains: string[];
  shops: Array<{ shop: string; scopes: string[]; connectedAt: string; updatedAt: string }>;
  errors: string[];
  warnings: string[];
};

type RecentCommandsData = {
  commands: Array<{
    summary: string;
    operation: string;
    shop: string;
    mutating: boolean;
    dryRun: boolean;
    ok: boolean;
    createdAt: string;
  }>;
};

const panelStyle = {
  border: "1px solid var(--border, #d7d7d7)",
  background: "var(--card, #fff)",
  padding: 16,
} as const;

const mutedStyle = {
  color: "var(--muted-foreground, #666)",
  fontSize: 13,
} as const;

function StatusPanel({ compact = false }: { compact?: boolean }) {
  const host = useHostContext();
  const status = usePluginData<StatusData>(DATA_KEYS.status, { companyId: host.companyId });
  const data = status.data;

  if (status.loading) return <div style={mutedStyle}>Checking Shopify...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.configured ? "Configured" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>
          {data?.dryRun ? "Dry run" : "Live"}
        </span>
      </div>
      <div style={mutedStyle}>Connected shops: {data?.shops.length ?? 0}</div>
      {!compact ? (
        <>
          <div style={mutedStyle}>Admin API: {data?.apiVersion ?? "2026-04"}</div>
          <div style={mutedStyle}>Scopes: {(data?.requestedScopes ?? []).join(", ")}</div>
          <div style={mutedStyle}>Operations: {(data?.allowedOperations ?? []).join(", ")}</div>
          <div style={mutedStyle}>Raw GraphQL: {data?.rawEnabled ? "Enabled" : "Disabled"}</div>
        </>
      ) : null}
      {(data?.errors.length ?? 0) > 0 ? (
        <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{data!.errors.join(" ")}</div>
      ) : null}
      {(data?.warnings.length ?? 0) > 0 ? <div style={mutedStyle}>{data!.warnings.join(" ")}</div> : null}
    </div>
  );
}

function ConnectedShops() {
  const host = useHostContext();
  const status = usePluginData<StatusData>(DATA_KEYS.status, { companyId: host.companyId });
  const shops = status.data?.shops ?? [];
  if (shops.length === 0) return <div style={mutedStyle}>No Shopify stores are connected yet.</div>;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {shops.map((shop) => (
        <div key={shop.shop} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{shop.shop}</div>
          <div style={mutedStyle}>{shop.scopes.join(", ")}</div>
          <div style={mutedStyle}>Updated {shop.updatedAt}</div>
        </div>
      ))}
    </div>
  );
}

function RecentCommands() {
  const host = useHostContext();
  const recent = usePluginData<RecentCommandsData>(DATA_KEYS.recentCommands, { companyId: host.companyId });
  if (recent.loading) return <div style={mutedStyle}>Loading recent Shopify commands...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent command audit is unavailable.</div>;
  const commands = recent.data?.commands ?? [];
  if (commands.length === 0) return <div style={mutedStyle}>No Shopify commands have been run yet.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {commands.map((command, index) => (
        <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{command.summary}</div>
          <div style={mutedStyle}>
            {command.shop} · {command.ok ? "ok" : "failed"} · {command.dryRun ? "dry run" : "live"} · {command.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShopifyDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <RecentCommands />
    </section>
  );
}

export function ShopifyPage(_props: PluginPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>Shopify</h1>
        <p style={{ ...mutedStyle, marginTop: 6 }}>
          Store, product, inventory, order, page, and webhook tools for PaperClaw agents.
        </p>
      </header>
      <section style={panelStyle}>
        <StatusPanel />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Connected stores</h2>
        <ConnectedShops />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Recent command audit</h2>
        <RecentCommands />
      </section>
    </main>
  );
}

export function ShopifySettingsPage(_props: PluginSettingsPageProps) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Connection</h2>
        <StatusPanel />
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>OAuth setup</h2>
        <div style={mutedStyle}>
          Create a Shopify app, set the callback to this plugin&apos;s OAuth callback route, add the API key and app secret reference, then open the OAuth start route with a shop and companyId query.
        </div>
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Agent guardrails</h2>
        <div style={mutedStyle}>
          Mutating tools respect dry-run mode, operation allowlists, shop allowlists, and inventory adjustment limits. Raw GraphQL stays disabled until explicitly enabled.
        </div>
      </div>
    </section>
  );
}
