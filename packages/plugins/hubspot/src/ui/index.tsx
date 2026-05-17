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
  authMode: "private_token" | "oauth";
  connectedAt: string | null;
  portalId: string | null;
  dryRun: boolean;
  enableRawApiTool: boolean;
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

type PluginConfigResponse = { configJson?: Record<string, unknown> } | null;
type SecretUpsertResponse = { secretRef: string };
type OauthStartResponse = { authorizationUrl: string; state: string; redirectUri: string };
type OauthCompleteResponse = { refreshTokenSecretRef: string; portalId: string };

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

  if (status.loading) return <div style={mutedStyle}>Checking HubSpot connector...</div>;
  if (status.error) return <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{status.error.message}</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <strong>{data?.connected ? "HubSpot connected" : "Setup needed"}</strong>
        <span style={{ ...mutedStyle, border: "1px solid var(--border, #d7d7d7)", padding: "2px 6px" }}>
          {data?.dryRun ? "Dry run" : "Live"}
        </span>
      </div>
      {!compact ? (
        <>
          <div style={mutedStyle}>Auth: {data?.authMode === "oauth" ? "OAuth" : "Private app token"}</div>
          <div style={mutedStyle}>Portal: {data?.portalId || "Not recorded"}</div>
          <div style={mutedStyle}>Connected: {data?.connectedAt ?? "Not connected"}</div>
          <div style={mutedStyle}>Redirect URI: {data?.redirectUri ?? inferRedirectUri()}</div>
          <div style={mutedStyle}>Raw API tool: {data?.enableRawApiTool ? "enabled" : "disabled"}</div>
          <div style={mutedStyle}>Scopes: {(data?.scopes ?? []).join(", ")}</div>
          <div style={mutedStyle}>Plugin version: {data?.version ?? "unknown"}</div>
        </>
      ) : null}
      {(data?.errors.length ?? 0) > 0 ? <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{data!.errors.join(" ")}</div> : null}
      {(data?.warnings.length ?? 0) > 0 ? <div style={mutedStyle}>{data!.warnings.join(" ")}</div> : null}
    </div>
  );
}

function RecentCommands() {
  const host = useHostContext();
  const recent = usePluginData<RecentCommandsData>(DATA_KEYS.recentCommands, { companyId: host.companyId });
  if (recent.loading) return <div style={mutedStyle}>Loading recent HubSpot requests...</div>;
  if (recent.error) return <div style={mutedStyle}>Recent HubSpot audit is unavailable.</div>;
  const commands = recent.data?.commands ?? [];
  if (commands.length === 0) return <div style={mutedStyle}>No HubSpot requests have been run yet.</div>;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {commands.map((command, index) => (
        <div key={`${command.createdAt}-${index}`} style={{ borderTop: "1px solid var(--border, #d7d7d7)", paddingTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{command.operation}</div>
          <div style={mutedStyle}>{command.ok ? "ok" : "failed"} / {command.dryRun ? "dry run" : "live"} / {command.mutating ? "mutating" : "read"} / {command.createdAt}</div>
        </div>
      ))}
    </div>
  );
}

function HubSpotSetupForm() {
  const host = useHostContext();
  const savePrivateAccessToken = usePluginAction(ACTION_KEYS.savePrivateAccessToken);
  const saveClientSecret = usePluginAction(ACTION_KEYS.saveClientSecret);
  const startOauth = usePluginAction(ACTION_KEYS.startOauth);
  const completeOauth = usePluginAction(ACTION_KEYS.completeOauth);
  const status = usePluginData<StatusData>(DATA_KEYS.status, { companyId: host.companyId });
  const [authMode, setAuthMode] = useState<"private_token" | "oauth">("private_token");
  const [privateAccessToken, setPrivateAccessToken] = useState("");
  const [privateAccessTokenSecretRef, setPrivateAccessTokenSecretRef] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [clientSecretRef, setClientSecretRef] = useState("");
  const [refreshTokenSecretRef, setRefreshTokenSecretRef] = useState("");
  const [portalId, setPortalId] = useState("");
  const [redirectUri, setRedirectUri] = useState(inferRedirectUri());
  const [dryRun, setDryRun] = useState(true);
  const [enableRawApiTool, setEnableRawApiTool] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadConfig().then((config) => {
      if (cancelled) return;
      setAuthMode(config.authMode === "oauth" ? "oauth" : "private_token");
      setPrivateAccessTokenSecretRef(String(config.privateAccessTokenSecretRef ?? ""));
      setClientId(String(config.clientId ?? ""));
      setClientSecretRef(String(config.clientSecretRef ?? ""));
      setRefreshTokenSecretRef(String(config.refreshTokenSecretRef ?? ""));
      setPortalId(String(config.portalId ?? ""));
      setRedirectUri(String(config.redirectUri ?? "") || inferRedirectUri());
      setDryRun(typeof config.dryRun === "boolean" ? config.dryRun : DEFAULT_CONFIG.dryRun);
      setEnableRawApiTool(typeof config.enableRawApiTool === "boolean" ? config.enableRawApiTool : DEFAULT_CONFIG.enableRawApiTool);
    }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load HubSpot config."));
    return () => {
      cancelled = true;
    };
  }, []);

  const oauthCode = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("code");
  }, []);

  async function persistBaseConfig(next: Partial<Record<string, unknown>> = {}) {
    if (!host.companyId) throw new Error("Select a company before configuring HubSpot.");
    let nextPrivateRef = privateAccessTokenSecretRef;
    let nextClientSecretRef = clientSecretRef;
    if (privateAccessToken.trim()) {
      const secret = await savePrivateAccessToken({ companyId: host.companyId, privateAccessToken: privateAccessToken.trim() }) as SecretUpsertResponse;
      nextPrivateRef = secret.secretRef;
      setPrivateAccessTokenSecretRef(nextPrivateRef);
      setPrivateAccessToken("");
    }
    if (clientSecret.trim()) {
      const secret = await saveClientSecret({ companyId: host.companyId, clientSecret: clientSecret.trim() }) as SecretUpsertResponse;
      nextClientSecretRef = secret.secretRef;
      setClientSecretRef(nextClientSecretRef);
      setClientSecret("");
    }
    const configJson = {
      authMode,
      privateAccessTokenSecretRef: nextPrivateRef,
      clientId: clientId.trim(),
      clientSecretRef: nextClientSecretRef,
      refreshTokenSecretRef,
      connectedCompanyId: host.companyId,
      portalId,
      redirectUri: redirectUri.trim() || inferRedirectUri(),
      enabledScopes: [...DEFAULT_SCOPES],
      dryRun,
      enableRawApiTool,
      requestTimeoutMs: DEFAULT_CONFIG.requestTimeoutMs,
      maxOutputBytes: DEFAULT_CONFIG.maxOutputBytes,
      ...next,
    };
    await saveConfig(configJson);
    return configJson;
  }

  async function saveOnly() {
    try {
      setBusy(true);
      setError(null);
      await persistBaseConfig();
      setMessage("HubSpot settings saved.");
      status.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save HubSpot settings.");
    } finally {
      setBusy(false);
    }
  }

  async function connectOauth() {
    try {
      setBusy(true);
      setError(null);
      const configJson = await persistBaseConfig({ authMode: "oauth" });
      const result = await startOauth({
        clientId: clientId.trim(),
        clientSecretRef: configJson.clientSecretRef,
        redirectUri: redirectUri.trim() || inferRedirectUri(),
        enabledScopes: [...DEFAULT_SCOPES],
      }) as OauthStartResponse;
      window.localStorage.setItem("paperclaw.hubspot.oauth", JSON.stringify({ state: result.state, redirectUri: result.redirectUri }));
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start HubSpot OAuth.");
    } finally {
      setBusy(false);
    }
  }

  async function finishOauth() {
    try {
      if (!host.companyId) throw new Error("Select a company before completing HubSpot OAuth.");
      if (!oauthCode) throw new Error("No HubSpot OAuth code found in the current URL.");
      setBusy(true);
      setError(null);
      const stored = JSON.parse(window.localStorage.getItem("paperclaw.hubspot.oauth") ?? "{}") as { state?: string; redirectUri?: string };
      const returnedState = new URLSearchParams(window.location.search).get("state");
      if (stored.state && returnedState && stored.state !== returnedState) throw new Error("HubSpot OAuth state did not match.");
      if (!stored.redirectUri) throw new Error("Missing OAuth redirect URI. Start the HubSpot connection again.");
      const result = await completeOauth({
        companyId: host.companyId,
        clientId: clientId.trim(),
        clientSecretRef,
        code: oauthCode,
        redirectUri: stored.redirectUri,
      }) as OauthCompleteResponse;
      setRefreshTokenSecretRef(result.refreshTokenSecretRef);
      setPortalId(result.portalId);
      await persistBaseConfig({
        authMode: "oauth",
        refreshTokenSecretRef: result.refreshTokenSecretRef,
        portalId: result.portalId,
        connectedAt: new Date().toISOString(),
      });
      window.localStorage.removeItem("paperclaw.hubspot.oauth");
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState(null, "", url.toString());
      setMessage("HubSpot OAuth connection saved.");
      status.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete HubSpot OAuth.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
        Auth Mode
        <select style={inputStyle} value={authMode} onChange={(event) => setAuthMode(event.target.value === "oauth" ? "oauth" : "private_token")} disabled={busy}>
          <option value="private_token">Private app token</option>
          <option value="oauth">OAuth app</option>
        </select>
      </label>
      {authMode === "private_token" ? (
        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
          Private App Access Token
          <input style={inputStyle} type="password" value={privateAccessToken} onChange={(event) => setPrivateAccessToken(event.target.value)} disabled={busy} placeholder={privateAccessTokenSecretRef ? "Token already saved" : ""} />
        </label>
      ) : (
        <>
          <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
            OAuth Client ID
            <input style={inputStyle} value={clientId} onChange={(event) => setClientId(event.target.value)} disabled={busy} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
            OAuth Client Secret
            <input style={inputStyle} type="password" value={clientSecret} onChange={(event) => setClientSecret(event.target.value)} disabled={busy} placeholder={clientSecretRef ? "Secret already saved" : ""} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
            Redirect URI
            <input style={inputStyle} value={redirectUri} onChange={(event) => setRedirectUri(event.target.value)} disabled={busy} />
          </label>
        </>
      )}
      <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
        HubSpot Portal ID
        <input style={inputStyle} value={portalId} onChange={(event) => setPortalId(event.target.value)} disabled={busy} />
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} disabled={busy} />
        Dry run mutating HubSpot tools
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={enableRawApiTool} onChange={(event) => setEnableRawApiTool(event.target.checked)} disabled={busy} />
        Enable guarded raw CRM API tool
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" style={buttonStyle} onClick={saveOnly} disabled={busy || !host.companyId}>Save Settings</button>
        {authMode === "oauth" ? <button type="button" style={buttonStyle} onClick={connectOauth} disabled={busy || !host.companyId}>Connect OAuth</button> : null}
        {authMode === "oauth" && oauthCode ? <button type="button" style={buttonStyle} onClick={finishOauth} disabled={busy || !host.companyId}>Finish OAuth</button> : null}
      </div>
      {message ? <div style={mutedStyle}>{message}</div> : null}
      {error ? <div style={{ color: "var(--destructive, #b00020)", fontSize: 13 }}>{error}</div> : null}
    </div>
  );
}

export function HubSpotDashboardWidget(_props: PluginWidgetProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <StatusPanel compact />
      <RecentCommands />
    </section>
  );
}

export function HubSpotPage(_props: PluginPageProps) {
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
          <div>CRM records: contacts, companies, deals, tickets, notes, and tasks.</div>
          <div>Metadata: properties, owners, pipelines, associations, and batch operations.</div>
          <div>Keep dry run enabled while agents prepare CRM changes; switch to live only after board approval.</div>
        </div>
      </section>
    </main>
  );
}

export function HubSpotSettingsPage(_props: PluginSettingsPageProps) {
  return (
    <main style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      <section style={panelStyle}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>HubSpot Setup</h2>
        <HubSpotSetupForm />
      </section>
      <section style={panelStyle}>
        <StatusPanel />
      </section>
    </main>
  );
}
