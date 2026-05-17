import { useEffect, useMemo, useState } from "react";
import {
  useHostContext,
  usePluginAction,
  usePluginData,
  type PluginPageProps,
  type PluginSettingsPageProps,
  type PluginWidgetProps,
} from "@kesarcloud/plugin-sdk/ui";
import { ACTION_KEYS, DATA_KEYS, DEFAULT_CONFIG, DEFAULT_SCOPES, PLUGIN_ID } from "../constants.js";

type StatusData = {
  version: string;
  connected: boolean;
  connectedCompanyId: string | null;
  connectedAt: string | null;
  connectedUserId: string | null;
  connectedUsername: string | null;
  connectedDisplayName: string | null;
  dryRun: boolean;
  scopes: string[];
  redirectUri: string | null;
  errors: string[];
  warnings: string[];
};

type RecentCommandsData = {
  commands: Array<{
    operation: string;
    mutating: boolean;
    dryRun: boolean;
    ok: boolean;
    createdAt: string;
  }>;
};

type PluginConfigResponse = {
  configJson?: Record<string, unknown>;
} | null;

type OauthStartResponse = {
  authorizationUrl: string;
  codeVerifier: string;
  state: string;
  redirectUri: string;
};

type OauthCompleteResponse = {
  refreshTokenSecretRef: string;
  connectedUserId: string;
  connectedUsername: string;
  connectedDisplayName: string;
  scope: string;
};

type SecretUpsertResponse = {
  secretRef: string;
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

const inputStyle = {
  width: "100%",
  border: "1px solid var(--border, #d7d7d7)",
  background: "var(--background, #fff)",
  color: "var(--foreground, #111)",
  padding: "8px 10px",
  fontSize: 14,
} as const;

const buttonStyle = {
  border: "1px solid var(--border, #d7d7d7)",
  background: "var(--primary, #111)",
  color: "var(--primary-foreground, #fff)",
  padding: "8px 12px",
  fontSize: 14,
  cursor: "pointer",
} as const;

function inferRedirectUri() {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) as unknown : null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && typeof (payload as { error?: unknown }).error === "string"
      ? (payload as { error: string }).error
      : response.statusText;
    throw new Error(message);
  }
  return payload as T;
}

async function loadConfig() {
  const response = await apiJson<PluginConfigResponse>(`/api/plugins/${encodeURIComponent(PLUGIN_ID)}/config`);
  return response?.configJson ?? {};
}

async function saveConfig(configJson: Record<string, unknown>) {
  await apiJson(`/api/plugins/${encodeURIComponent(PLUGIN_ID)}/config`, {
    method: "POST",
    body: JSON.stringify({ configJson }),
  });
}

function StatusPanel({ compact = false }: { compact?: boolean }) {
  const host = useHostContext();
  const status = usePluginData<StatusData>(DATA_KEYS.status, { companyId: host.companyId });
  const data = status.data;

  if (status.loading) return <div style={mutedStyle}>Checking X connector...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;

  const user = data?.connectedUsername ? `@${data.connectedUsername}` : data?.connectedDisplayName || data?.connectedUserId || "Not connected";

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.connected ? "X connected" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>
          {data?.dryRun ? "Dry run" : "Live"}
        </span>
      </div>
      {!compact ? (
        <>
          <div style={mutedStyle}>User: {user}</div>
          <div style={mutedStyle}>Connected: {data?.connectedAt ?? "Not connected"}</div>
          <div style={mutedStyle}>Redirect URI: {data?.redirectUri ?? inferRedirectUri()}</div>
          <div style={mutedStyle}>Scopes: {(data?.scopes ?? []).join(", ")}</div>
          <div style={mutedStyle}>Plugin version: {data?.version ?? "unknown"}</div>
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
  if (recent.loading) return <div style={mutedStyle}>Loading recent X requests...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent X audit is unavailable.</div>;
  const commands = recent.data?.commands ?? [];
  if (commands.length === 0) return <div style={mutedStyle}>No X requests have been run yet.</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {commands.map((command, index) => (
        <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{command.operation}</div>
          <div style={mutedStyle}>
            {command.ok ? "ok" : "failed"} / {command.dryRun ? "dry run" : "live"} / {command.mutating ? "mutating" : "read"} / {command.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
}

function XSetupForm() {
  const host = useHostContext();
  const startOauth = usePluginAction(ACTION_KEYS.startOauth);
  const saveClientSecret = usePluginAction(ACTION_KEYS.saveClientSecret);
  const completeOauth = usePluginAction(ACTION_KEYS.completeOauth);
  const status = usePluginData<StatusData>(DATA_KEYS.status, { companyId: host.companyId });
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [clientSecretRef, setClientSecretRef] = useState("");
  const [refreshTokenSecretRef, setRefreshTokenSecretRef] = useState("");
  const [connectedUserId, setConnectedUserId] = useState("");
  const [connectedUsername, setConnectedUsername] = useState("");
  const [connectedDisplayName, setConnectedDisplayName] = useState("");
  const [redirectUri, setRedirectUri] = useState(inferRedirectUri());
  const [dryRun, setDryRun] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadConfig().then((config) => {
      if (cancelled) return;
      setClientId(String(config.clientId ?? ""));
      setClientSecretRef(String(config.clientSecretRef ?? ""));
      setRefreshTokenSecretRef(String(config.refreshTokenSecretRef ?? ""));
      setConnectedUserId(String(config.connectedUserId ?? ""));
      setConnectedUsername(String(config.connectedUsername ?? ""));
      setConnectedDisplayName(String(config.connectedDisplayName ?? ""));
      setRedirectUri(String(config.redirectUri ?? "") || inferRedirectUri());
      setDryRun(typeof config.dryRun === "boolean" ? config.dryRun : DEFAULT_CONFIG.dryRun);
    }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load X config."));
    return () => {
      cancelled = true;
    };
  }, []);

  const oauthCode = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("code");
  }, []);

  async function persistBaseConfig(next: Partial<Record<string, unknown>> = {}) {
    if (!host.companyId) throw new Error("Select a company before configuring X.");
    let nextClientSecretRef = clientSecretRef;
    if (clientSecret.trim()) {
      const secret = await saveClientSecret({
        companyId: host.companyId,
        clientSecret: clientSecret.trim(),
      }) as SecretUpsertResponse;
      nextClientSecretRef = secret.secretRef;
      setClientSecretRef(nextClientSecretRef);
      setClientSecret("");
    }
    const configJson = {
      clientId: clientId.trim(),
      clientSecretRef: nextClientSecretRef,
      refreshTokenSecretRef,
      connectedCompanyId: host.companyId,
      connectedUserId,
      connectedUsername,
      connectedDisplayName,
      redirectUri: redirectUri.trim() || inferRedirectUri(),
      enabledScopes: [...DEFAULT_SCOPES],
      dryRun,
      maxPollAttempts: DEFAULT_CONFIG.maxPollAttempts,
      requestTimeoutMs: DEFAULT_CONFIG.requestTimeoutMs,
      ...next,
    };
    await saveConfig(configJson);
    return configJson;
  }

  async function connect() {
    try {
      setBusy(true);
      setError(null);
      const configJson = await persistBaseConfig();
      const result = await startOauth({
        clientId: clientId.trim(),
        clientSecretRef: configJson.clientSecretRef,
        redirectUri: redirectUri.trim() || inferRedirectUri(),
        enabledScopes: [...DEFAULT_SCOPES],
      }) as OauthStartResponse;
      window.localStorage.setItem("paperclaw.x.oauth", JSON.stringify({
        codeVerifier: result.codeVerifier,
        state: result.state,
        redirectUri: result.redirectUri,
      }));
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start X OAuth.");
    } finally {
      setBusy(false);
    }
  }

  async function finishConnection() {
    try {
      if (!host.companyId) throw new Error("Select a company before completing X OAuth.");
      if (!oauthCode) throw new Error("No X OAuth code found in the current URL.");
      setBusy(true);
      setError(null);
      const stored = JSON.parse(window.localStorage.getItem("paperclaw.x.oauth") ?? "{}") as {
        codeVerifier?: string;
        redirectUri?: string;
        state?: string;
      };
      const returnedState = new URLSearchParams(window.location.search).get("state");
      if (!stored.codeVerifier || !stored.redirectUri) throw new Error("Missing OAuth verifier. Start the X connection again.");
      if (stored.state && returnedState && stored.state !== returnedState) throw new Error("X OAuth state did not match.");
      const result = await completeOauth({
        companyId: host.companyId,
        clientId: clientId.trim(),
        clientSecretRef,
        code: oauthCode,
        codeVerifier: stored.codeVerifier,
        redirectUri: stored.redirectUri,
      }) as OauthCompleteResponse;
      const refreshRef = result.refreshTokenSecretRef;
      setRefreshTokenSecretRef(refreshRef);
      setConnectedUserId(result.connectedUserId);
      setConnectedUsername(result.connectedUsername);
      setConnectedDisplayName(result.connectedDisplayName);
      await persistBaseConfig({
        refreshTokenSecretRef: refreshRef,
        connectedUserId: result.connectedUserId,
        connectedUsername: result.connectedUsername,
        connectedDisplayName: result.connectedDisplayName,
        connectedAt: new Date().toISOString(),
      });
      window.localStorage.removeItem("paperclaw.x.oauth");
      setMessage("X connection saved.");
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState(null, "", url.toString());
      status.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete X OAuth.");
    } finally {
      setBusy(false);
    }
  }

  async function saveOnly() {
    try {
      setBusy(true);
      setError(null);
      await persistBaseConfig();
      setMessage("X settings saved.");
      status.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save X settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
        X Client ID
        <input style={inputStyle} value={clientId} onChange={(event) => setClientId(event.target.value)} disabled={busy} />
      </label>
      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
        X Client Secret
        <input style={inputStyle} type="password" value={clientSecret} onChange={(event) => setClientSecret(event.target.value)} disabled={busy} placeholder={clientSecretRef ? "Secret already saved" : ""} />
      </label>
      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
        Redirect URI
        <input style={inputStyle} value={redirectUri} onChange={(event) => setRedirectUri(event.target.value)} disabled={busy} />
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} disabled={busy} />
        Dry run mutating X tools
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" style={buttonStyle} onClick={connect} disabled={busy || !host.companyId}>Connect X</button>
        {oauthCode ? <button type="button" style={buttonStyle} onClick={finishConnection} disabled={busy || !host.companyId}>Finish OAuth</button> : null}
        <button type="button" style={{ ...buttonStyle, background: "var(--secondary, #f5f5f5)", color: "var(--secondary-foreground, #111)" }} onClick={saveOnly} disabled={busy || !host.companyId}>Save Settings</button>
      </div>
      {message ? <div style={mutedStyle}>{message}</div> : null}
      {error ? <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{error}</div> : null}
    </div>
  );
}

export function XDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <RecentCommands />
    </section>
  );
}

export function XPage(_props: PluginPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, maxWidth: 920 }}>
      <section style={panelStyle}>
        <StatusPanel />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Recent Requests</h2>
        <RecentCommands />
      </section>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Available Tool Groups</h2>
        <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
          <div>Identity, user lookup, timelines, mentions, and recent search.</div>
          <div>Create, delete, repost, like, bookmark, follow, list, media upload, and DM actions.</div>
          <div>Use dry run while wiring campaigns; switch to live only after board approval.</div>
        </div>
      </section>
    </main>
  );
}

export function XSettingsPage(_props: PluginSettingsPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>X OAuth Setup</h2>
        <XSetupForm />
      </section>
      <section style={panelStyle}>
        <StatusPanel />
      </section>
    </main>
  );
}
