import {
  useHostContext,
  usePluginData,
  type PluginPageProps,
  type PluginSettingsPageProps,
  type PluginWidgetProps,
} from "@kesarcloud/plugin-sdk/ui";
import { DATA_KEYS } from "../constants.js";

type StatusData = {
  gws: { installed: boolean; version: string | null; installError: string | null };
  dryRun: boolean;
  rawEnabled: boolean;
  allowedServices: string[];
  gwsConfigDir: string | null;
  errors: string[];
  warnings: string[];
};

type RecentCommandsData = {
  commands: Array<{
    service: string;
    summary: string;
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

  if (status.loading) return <div style={mutedStyle}>Checking Google Workspace...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.gws.installed ? "gws ready" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>
          {data?.dryRun ? "Dry run" : "Live"}
        </span>
      </div>
      {!compact ? (
        <>
          <div style={mutedStyle}>Version: {data?.gws.version ?? "Not found"}</div>
          <div style={mutedStyle}>Config dir: {data?.gwsConfigDir ?? "Default gws profile"}</div>
          <div style={mutedStyle}>Services: {(data?.allowedServices ?? []).join(", ")}</div>
          <div style={mutedStyle}>Raw tool: {data?.rawEnabled ? "Enabled" : "Disabled"}</div>
        </>
      ) : null}
      {data?.gws.installError ? <div style={mutedStyle}>Install: {data.gws.installError}</div> : null}
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
  if (recent.loading) return <div style={mutedStyle}>Loading recent Workspace commands...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent command audit is unavailable.</div>;
  const commands = recent.data?.commands ?? [];
  if (commands.length === 0) return <div style={mutedStyle}>No Google Workspace commands have been run yet.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {commands.map((command, index) => (
        <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{command.service}: {command.summary}</div>
          <div style={mutedStyle}>
            {command.ok ? "ok" : "failed"} · {command.dryRun ? "dry run" : "live"} · {command.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GoogleWorkspaceDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <RecentCommands />
    </section>
  );
}

export function GoogleWorkspacePage(_props: PluginPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>Google Workspace</h1>
        <p style={{ ...mutedStyle, marginTop: 6 }}>
          Gmail, Calendar, Drive, Docs, Sheets, and Chat tools for PaperClaw agents.
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

export function GoogleWorkspaceSettingsPage(_props: PluginSettingsPageProps) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Connection</h2>
        <StatusPanel />
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Setup</h2>
        <div style={mutedStyle}>
          Install the Google Workspace CLI, run gws auth setup, then gws auth login. Set gwsConfigDir only when using a dedicated authenticated profile for PaperClaw.
        </div>
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Agent tools</h2>
        <div style={mutedStyle}>
          Curated tools cover Gmail, Calendar, Drive, Docs, Sheets, and Chat. The raw gws tool stays disabled until explicitly enabled.
        </div>
      </div>
    </section>
  );
}
