import {
  useHostContext,
  usePluginData,
  type PluginPageProps,
  type PluginSettingsPageProps,
  type PluginWidgetProps,
} from "@kesarcloud/plugin-sdk/ui";
import { DATA_KEYS } from "../constants.js";

type StatusData = {
  metaCli: { installed: boolean; version: string | null; installError: string | null };
  dryRun: boolean;
  rawEnabled: boolean;
  allowedOperations: string[];
  allowedAdAccountIds: string[];
  metaConfigDir: string | null;
  maxBudgetChangePercent: number;
  maxDailyBudgetCents: number;
  errors: string[];
  warnings: string[];
};

type RecentCommandsData = {
  commands: Array<{
    summary: string;
    operation: string;
    adAccountId?: string;
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
  const status = usePluginData<StatusData>(DATA_KEYS.status);
  const data = status.data;

  if (status.loading) return <div style={mutedStyle}>Checking Meta Ads connector...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.metaCli.installed ? "Meta CLI ready" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>
          {data?.dryRun ? "Dry run" : "Live"}
        </span>
      </div>
      {!compact ? (
        <>
          <div style={mutedStyle}>Version: {data?.metaCli.version ?? "Not found"}</div>
          <div style={mutedStyle}>Config dir: {data?.metaConfigDir ?? "Default Meta CLI profile"}</div>
          <div style={mutedStyle}>Operations: {(data?.allowedOperations ?? []).join(", ")}</div>
          <div style={mutedStyle}>Ad accounts: {(data?.allowedAdAccountIds ?? []).join(", ") || "All accessible accounts"}</div>
          <div style={mutedStyle}>Raw tool: {data?.rawEnabled ? "Enabled" : "Disabled"}</div>
          <div style={mutedStyle}>Budget guard: {data?.maxDailyBudgetCents ?? 0} cents daily, {data?.maxBudgetChangePercent ?? 0}% change</div>
        </>
      ) : null}
      {data?.metaCli.installError ? <div style={mutedStyle}>Install: {data.metaCli.installError}</div> : null}
      {(data?.errors.length ?? 0) > 0 ? (
        <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{data!.errors.join(" ")}</div>
      ) : null}
      {(data?.warnings.length ?? 0) > 0 ? <div style={mutedStyle}>{data!.warnings.join(" ")}</div> : null}
    </div>
  );
}

function RecentCommands() {
  const host = useHostContext();
  const recent = usePluginData<RecentCommandsData>(DATA_KEYS.recentCommands, { companyId: host.companyId });
  if (recent.loading) return <div style={mutedStyle}>Loading recent Meta Ads commands...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent command audit is unavailable.</div>;
  const commands = recent.data?.commands ?? [];
  if (commands.length === 0) return <div style={mutedStyle}>No Meta Ads commands have been run yet.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {commands.map((command, index) => (
        <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{command.operation}: {command.summary}</div>
          <div style={mutedStyle}>
            {command.ok ? "ok" : "failed"} / {command.dryRun ? "dry run" : "live"} / {command.adAccountId ?? "no account"} / {command.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetaAdsDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <RecentCommands />
    </section>
  );
}

export function MetaAdsPage(_props: PluginPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>Meta Ads</h1>
        <p style={{ ...mutedStyle, marginTop: 6 }}>
          Campaign, ad set, ads, catalog, insights, and diagnostics tools for PaperClaw agents.
        </p>
      </header>
      <section style={panelStyle}>
        <StatusPanel />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Recent command audit</h2>
        <RecentCommands />
      </section>
    </main>
  );
}

export function MetaAdsSettingsPage(_props: PluginSettingsPageProps) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Connection</h2>
        <StatusPanel />
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Setup</h2>
        <div style={mutedStyle}>
          Install Meta's official Ads AI Connector CLI, authenticate it with a Meta Business account, then set the binary path and optional config directory here.
        </div>
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Agent guardrails</h2>
        <div style={mutedStyle}>
          Keep dry run enabled until a human verifies account access. Use the ad account allowlist and budget guards before live campaign changes.
        </div>
      </div>
    </section>
  );
}
