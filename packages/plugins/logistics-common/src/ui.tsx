import { useHostContext, usePluginData, type PluginPageProps, type PluginSettingsPageProps, type PluginWidgetProps } from "@kesarcloud/plugin-sdk/ui";

type StatusData = {
  displayName: string;
  docsUrl: string;
  setupNotes: string;
  configured: boolean;
  baseUrl: string;
  apiVersion: string;
  accountId: string;
  dryRun: boolean;
  allowedOperations: string[];
  errors: string[];
  warnings: string[];
};

type RecentCommandsData = {
  commands: Array<{
    summary: string;
    operation: string;
    dryRun: boolean;
    ok: boolean;
    createdAt: string;
    error?: string;
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
  const status = usePluginData<StatusData>("status", { companyId: host.companyId });
  const data = status.data;
  if (status.loading) return <div style={mutedStyle}>Checking logistics connector...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.configured ? "Configured" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>{data?.dryRun ? "Dry run" : "Live"}</span>
      </div>
      <div style={mutedStyle}>Base URL: {data?.baseUrl || "Not set"}</div>
      {!compact ? (
        <>
          <div style={mutedStyle}>API version: {data?.apiVersion || "Default"}</div>
          <div style={mutedStyle}>Account: {data?.accountId || "Not required"}</div>
          <div style={mutedStyle}>Operations: {(data?.allowedOperations ?? []).join(", ")}</div>
          <div style={mutedStyle}>Docs: {data?.docsUrl}</div>
        </>
      ) : null}
      {(data?.errors.length ?? 0) > 0 ? <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{data!.errors.join(" ")}</div> : null}
      {(data?.warnings.length ?? 0) > 0 ? <div style={mutedStyle}>{data!.warnings.join(" ")}</div> : null}
    </div>
  );
}

function RecentCommands() {
  const host = useHostContext();
  const recent = usePluginData<RecentCommandsData>("recent-commands", { companyId: host.companyId });
  if (recent.loading) return <div style={mutedStyle}>Loading recent logistics commands...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent command audit is unavailable.</div>;
  const commands = recent.data?.commands ?? [];
  if (commands.length === 0) return <div style={mutedStyle}>No logistics commands have been run yet.</div>;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {commands.map((command, index) => (
        <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{command.summary}</div>
          <div style={mutedStyle}>{command.ok ? "ok" : "failed"} · {command.dryRun ? "dry run" : "live"} · {command.createdAt}</div>
          {command.error ? <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{command.error}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function LogisticsDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <RecentCommands />
    </section>
  );
}

export function LogisticsPage(_props: PluginPageProps) {
  const host = useHostContext();
  const status = usePluginData<StatusData>("status", { companyId: host.companyId });
  const title = status.data?.displayName ?? "Courier & Logistics";
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>{title}</h1>
        <p style={{ ...mutedStyle, marginTop: 6 }}>Rates, shipments, labels, tracking, pickups, address validation, and webhook tools for PaperClaw agents.</p>
      </header>
      <section style={panelStyle}><StatusPanel /></section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Recent command audit</h2>
        <RecentCommands />
      </section>
    </main>
  );
}

export function LogisticsSettingsPage(_props: PluginSettingsPageProps) {
  const host = useHostContext();
  const status = usePluginData<StatusData>("status", { companyId: host.companyId });
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Connection</h2>
        <StatusPanel />
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Setup</h2>
        <div style={mutedStyle}>{status.data?.setupNotes ?? "Configure credentials and keep dry run enabled until read tools succeed."}</div>
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Agent guardrails</h2>
        <div style={mutedStyle}>Label purchase, shipment creation, and pickup tools respect dry-run mode, operation allowlists, output limits, and activity logging.</div>
      </div>
    </section>
  );
}
