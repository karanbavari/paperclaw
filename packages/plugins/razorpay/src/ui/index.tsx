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
  modeLabel: string;
  dryRun: boolean;
  apiBaseUrl: string;
  allowedOperations: string[];
  allowedCurrencies: string[];
  webhookConfigured: boolean;
  recentWebhookCount: number;
  errors: string[];
  warnings: string[];
};

type RecentCommandsData = {
  commands: Array<{
    summary: string;
    operation: string;
    method: string;
    path: string;
    mutating: boolean;
    dryRun: boolean;
    ok: boolean;
    createdAt: string;
  }>;
};

type RecentWebhooksData = {
  webhooks: Array<{
    eventId: string;
    event: string;
    entityTypes: string[];
    receivedAt: string;
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

  if (status.loading) return <div style={mutedStyle}>Checking Razorpay...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.configured ? "Configured" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>
          {data?.dryRun ? "Dry run" : "Live"} · {data?.modeLabel ?? "test"}
        </span>
      </div>
      {!compact ? (
        <>
          <div style={mutedStyle}>Gateway: {data?.apiBaseUrl ?? "https://api.razorpay.com/v1"}</div>
          <div style={mutedStyle}>Operations: {(data?.allowedOperations ?? []).join(", ")}</div>
          <div style={mutedStyle}>Currencies: {(data?.allowedCurrencies ?? []).join(", ")}</div>
          <div style={mutedStyle}>Webhook: {data?.webhookConfigured ? "Configured" : "Not configured"}</div>
        </>
      ) : null}
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
  if (recent.loading) return <div style={mutedStyle}>Loading recent Razorpay commands...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent command audit is unavailable.</div>;
  const commands = recent.data?.commands ?? [];
  if (commands.length === 0) return <div style={mutedStyle}>No Razorpay commands have been run yet.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {commands.map((command, index) => (
        <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{command.summary}</div>
          <div style={mutedStyle}>
            {command.method} {command.path} · {command.ok ? "ok" : "failed"} · {command.dryRun ? "dry run" : "live"} · {command.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentWebhooks() {
  const recent = usePluginData<RecentWebhooksData>(DATA_KEYS.recentWebhooks);
  if (recent.loading) return <div style={mutedStyle}>Loading recent webhooks...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent webhook audit is unavailable.</div>;
  const webhooks = recent.data?.webhooks ?? [];
  if (webhooks.length === 0) return <div style={mutedStyle}>No Razorpay webhooks have been received yet.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {webhooks.map((event) => (
        <div key={event.eventId} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{event.event}</div>
          <div style={mutedStyle}>{event.entityTypes.join(", ") || "payload"} · {event.receivedAt}</div>
        </div>
      ))}
    </div>
  );
}

export function RazorpayDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <RecentCommands />
    </section>
  );
}

export function RazorpayPage(_props: PluginPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22 }}>Razorpay</h1>
        <p style={{ ...mutedStyle, marginTop: 6 }}>
          Merchant payment tools for orders, payments, refunds, payment links, customers, and webhooks.
        </p>
      </header>
      <section style={panelStyle}>
        <StatusPanel />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Recent command audit</h2>
        <RecentCommands />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Recent webhooks</h2>
        <RecentWebhooks />
      </section>
    </main>
  );
}

export function RazorpaySettingsPage(_props: PluginSettingsPageProps) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Connection</h2>
        <StatusPanel />
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Credentials</h2>
        <div style={mutedStyle}>
          Add the Razorpay Key ID and a PaperClaw secret reference for the Key Secret. Keep test and live keys separated by plugin configuration.
        </div>
      </div>
      <div style={panelStyle}>
        <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Agent guardrails</h2>
        <div style={mutedStyle}>
          Mutating tools respect dry-run mode, operation allowlists, currency allowlists, and amount limits. Incoming webhooks require signature verification.
        </div>
      </div>
    </section>
  );
}
