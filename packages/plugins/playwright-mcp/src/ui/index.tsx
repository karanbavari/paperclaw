import {
  useHostContext,
  usePluginData,
  type PluginPageProps,
  type PluginSettingsPageProps,
  type PluginWidgetProps,
} from "@kesarcloud/plugin-sdk/ui";
import { DATA_KEYS } from "../constants.js";

type StatusData = {
  connected: boolean;
  connectError: string | null;
  command: string;
  args: string[];
  headless: boolean;
  browser: string | null;
  caps: string[];
  allowedOrigins: string[];
  blockedOrigins: string[];
  checkConnectionOnStatus: boolean;
  discoveredToolCount: number;
  expectedToolCount: number;
  errors: string[];
  warnings: string[];
};

type RecentCommandsData = {
  commands: Array<{
    toolName: string;
    url?: string;
    ok: boolean;
    isError: boolean;
    truncated: boolean;
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

  if (status.loading) return <div style={mutedStyle}>Checking Playwright MCP...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.connected ? "Playwright MCP ready" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>
          {data?.headless ? "Headless" : "Headed"}
        </span>
      </div>
      {!compact ? (
        <>
          <div style={mutedStyle}>Command: {data?.command} {(data?.args ?? []).join(" ")}</div>
          <div style={mutedStyle}>Browser: {data?.browser ?? "default chrome"}</div>
          <div style={mutedStyle}>Caps: {(data?.caps ?? []).join(", ")}</div>
          <div style={mutedStyle}>Tools: {data?.checkConnectionOnStatus ? `${data.discoveredToolCount} discovered` : "connection check off"} / {data?.expectedToolCount ?? 0} expected</div>
          <div style={mutedStyle}>Allowed origins: {(data?.allowedOrigins ?? []).join(", ") || "Any"}</div>
          <div style={mutedStyle}>Blocked origins: {(data?.blockedOrigins ?? []).join(", ") || "None"}</div>
        </>
      ) : null}
      {data?.connectError ? <div style={mutedStyle}>Connect: {data.connectError}</div> : null}
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
  if (recent.loading) return <div style={mutedStyle}>Loading browser command audit...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent browser command audit is unavailable.</div>;
  const commands = recent.data?.commands ?? [];
  if (commands.length === 0) return <div style={mutedStyle}>No browser tools have been run yet.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {commands.map((command, index) => (
        <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{command.toolName}</div>
          <div style={mutedStyle}>
            {command.ok ? "ok" : "failed"} / {command.truncated ? "truncated" : "full"} / {command.url ?? "no url"} / {command.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlaywrightMcpDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <RecentCommands />
    </section>
  );
}

export function PlaywrightMcpPage(_props: PluginPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>Playwright MCP</h1>
        <p style={{ ...mutedStyle, marginTop: 6 }}>
          Browser automation tools for navigation, forms, screenshots, network, storage, testing, tracing, video, PDF, and vision workflows.
        </p>
      </header>
      <section style={panelStyle}>
        <StatusPanel />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Recent browser command audit</h2>
        <RecentCommands />
      </section>
    </main>
  );
}

export function PlaywrightMcpSettingsPage(_props: PluginSettingsPageProps) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Connection</h2>
        <StatusPanel />
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Setup</h2>
          <div style={mutedStyle}>
          The default command starts official Playwright MCP with npx. First-run can take a while, so status checks do not start the MCP process unless connection checking is enabled.
          </div>
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Agent access</h2>
        <div style={mutedStyle}>
          Full browser automation capabilities are enabled by default. Use allowed and blocked origins when you want to restrict where agents can navigate.
        </div>
      </div>
    </section>
  );
}
