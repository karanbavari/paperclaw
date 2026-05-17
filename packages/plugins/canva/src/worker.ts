import { definePlugin, runWorker, type PluginContext, type ToolResult, type ToolRunContext } from "@kesarcloud/plugin-sdk";
import { ACTION_KEYS, DATA_KEYS, DEFAULT_SCOPES, PLUGIN_VERSION, TOOL_NAMES } from "./constants.js";
import { CanvaClient, isConnected, normalizeConfig, summarizeResult, validateConfig, type CanvaConfig, type CanvaRequestPlan } from "./canva-client.js";
import { createCanvaAuthorizationUrl, createCodeVerifier, createOauthState } from "./oauth.js";

type Params = Record<string, unknown>;

const COMMAND_HISTORY_KEY = "recent-commands";

function asObject(value: unknown): Params {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Params : {};
}

function stringParam(params: Params, key: string, fallback = "") {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function requireString(params: Params, key: string) {
  const value = stringParam(params, key);
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function boolParam(params: Params, key: string, fallback = false) {
  return typeof params[key] === "boolean" ? params[key] as boolean : fallback;
}

function jsonObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Params : {};
}

function arrayParam(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function compactBody(value: Params) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== ""));
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

function assertCompanyConnected(config: CanvaConfig, companyId: string) {
  if (!isConnected(config)) throw new Error("Canva is not connected.");
  if (config.connectedCompanyId && config.connectedCompanyId !== companyId) {
    throw new Error("Canva is connected for a different PaperClaw company.");
  }
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: {
  operation: string;
  mutating: boolean;
  dryRun: boolean;
  ok: boolean;
  runId?: string;
  agentId?: string;
}) {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
  const list = Array.isArray(existing) ? existing : [];
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY }, [{
    ...input,
    createdAt: new Date().toISOString(),
  }, ...list].slice(0, 50));
}

async function audit(ctx: PluginContext, runCtx: ToolRunContext, plan: CanvaRequestPlan, result: { ok: boolean; dryRun: boolean }) {
  await rememberCommand(ctx, runCtx.companyId, {
    operation: plan.operation,
    mutating: Boolean(plan.mutating),
    dryRun: result.dryRun,
    ok: result.ok,
    runId: runCtx.runId,
    agentId: runCtx.agentId,
  });
  await ctx.activity.log({
    companyId: runCtx.companyId,
    message: `Canva ${result.dryRun ? "dry-run" : "request"}: ${plan.operation}`,
    metadata: {
      operation: plan.operation,
      method: plan.method,
      path: plan.path,
      mutating: Boolean(plan.mutating),
      dryRun: result.dryRun,
      ok: result.ok,
      runId: runCtx.runId,
      agentId: runCtx.agentId,
    },
  });
}

async function executePlan(ctx: PluginContext, runCtx: ToolRunContext, plan: CanvaRequestPlan): Promise<ToolResult> {
  const config = await getConfig(ctx);
  assertCompanyConnected(config, runCtx.companyId);

  if (config.dryRun && plan.mutating) {
    await audit(ctx, runCtx, plan, { ok: true, dryRun: true });
    return {
      content: `Dry run prepared for Canva: ${plan.operation}. Canva was not changed.`,
      data: {
        operation: plan.operation,
        method: plan.method,
        path: plan.path,
        query: plan.query ?? null,
        body: plan.body ?? null,
        dryRun: true,
      },
    };
  }

  try {
    const client = new CanvaClient(ctx, config);
    const response = await client.request(plan);
    await audit(ctx, runCtx, plan, { ok: true, dryRun: false });
    return {
      content: `Canva request completed: ${plan.operation}.`,
      data: summarizeResult(response),
    };
  } catch (error) {
    await audit(ctx, runCtx, plan, { ok: false, dryRun: false });
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

async function pollJob(client: CanvaClient, plan: CanvaRequestPlan, attempts: number) {
  let current = await client.request(plan);
  for (let index = 1; index < attempts; index += 1) {
    const status = (current.payload as { job?: { status?: string }; status?: string } | null)?.job?.status
      ?? (current.payload as { status?: string } | null)?.status;
    if (status && status !== "in_progress") break;
    await new Promise((resolve) => setTimeout(resolve, 750));
    current = await client.request(plan);
  }
  return current;
}

async function executeAsyncPlan(ctx: PluginContext, runCtx: ToolRunContext, createPlan: CanvaRequestPlan, getJobPlan: (payload: unknown) => CanvaRequestPlan | null, poll: boolean): Promise<ToolResult> {
  const config = await getConfig(ctx);
  assertCompanyConnected(config, runCtx.companyId);
  if (config.dryRun && createPlan.mutating) {
    await audit(ctx, runCtx, createPlan, { ok: true, dryRun: true });
    return { content: `Dry run prepared for Canva: ${createPlan.operation}. Canva was not changed.`, data: { ...createPlan, dryRun: true } };
  }
  try {
    const client = new CanvaClient(ctx, config);
    const created = await client.request(createPlan);
    let final = created;
    const jobPlan = poll ? getJobPlan(created.payload) : null;
    if (jobPlan) final = await pollJob(client, jobPlan, config.maxPollAttempts);
    await audit(ctx, runCtx, createPlan, { ok: true, dryRun: false });
    return { content: `Canva request completed: ${createPlan.operation}.`, data: { created: summarizeResult(created), final: summarizeResult(final) } };
  } catch (error) {
    await audit(ctx, runCtx, createPlan, { ok: false, dryRun: false });
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function jobIdFrom(payload: unknown, key = "job") {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const job = record[key] && typeof record[key] === "object" ? record[key] as Record<string, unknown> : record;
  return typeof job.id === "string" ? job.id : null;
}

function plans(params: Params): Record<string, CanvaRequestPlan> {
  const designId = stringParam(params, "designId");
  const assetId = stringParam(params, "assetId");
  const folderId = stringParam(params, "folderId");
  const threadId = stringParam(params, "threadId");
  const brandTemplateId = stringParam(params, "brandTemplateId");
  const jobId = stringParam(params, "jobId");
  return {
    [TOOL_NAMES.getCurrentUser]: { operation: "get current user", method: "GET", path: "/v1/users/me" },
    [TOOL_NAMES.getUserProfile]: { operation: "get user profile", method: "GET", path: "/v1/users/me/profile" },
    [TOOL_NAMES.getUserCapabilities]: { operation: "get user capabilities", method: "GET", path: "/v1/users/me/capabilities" },
    [TOOL_NAMES.listDesigns]: { operation: "list designs", method: "GET", path: "/v1/designs", query: compactBody({ query: stringParam(params, "query"), continuation: stringParam(params, "continuation"), ownership: stringParam(params, "ownership"), sort_by: stringParam(params, "sortBy") }) },
    [TOOL_NAMES.getDesign]: { operation: "get design", method: "GET", path: `/v1/designs/${encodeURIComponent(designId)}` },
    [TOOL_NAMES.createDesign]: { operation: "create design", method: "POST", path: "/v1/designs", body: compactBody({ design_type: jsonObject(params.designType), title: stringParam(params, "title") || undefined, asset_id: stringParam(params, "assetId") || undefined }), mutating: true },
    [TOOL_NAMES.getDesignPages]: { operation: "get design pages", method: "GET", path: `/v1/designs/${encodeURIComponent(designId)}/pages` },
    [TOOL_NAMES.getDesignExportFormats]: { operation: "get design export formats", method: "GET", path: `/v1/designs/${encodeURIComponent(designId)}/export-formats` },
    [TOOL_NAMES.createExportJob]: { operation: "create export job", method: "POST", path: "/v1/exports", body: compactBody({ design_id: designId, format: jsonObject(params.format), pages: arrayParam(params.pages).length ? arrayParam(params.pages) : undefined }), mutating: true },
    [TOOL_NAMES.getExportJob]: { operation: "get export job", method: "GET", path: `/v1/exports/${encodeURIComponent(stringParam(params, "exportId"))}` },
    [TOOL_NAMES.getAsset]: { operation: "get asset", method: "GET", path: `/v1/assets/${encodeURIComponent(assetId)}` },
    [TOOL_NAMES.uploadAssetFromUrl]: { operation: "upload asset from URL", method: "POST", path: "/v1/url-asset-uploads", body: { url: stringParam(params, "url"), name: stringParam(params, "name"), tags: arrayParam(params.tags) }, mutating: true },
    [TOOL_NAMES.updateAsset]: { operation: "update asset", method: "PATCH", path: `/v1/assets/${encodeURIComponent(assetId)}`, body: compactBody({ name: stringParam(params, "name") || undefined, tags: arrayParam(params.tags).length ? arrayParam(params.tags) : undefined }), mutating: true },
    [TOOL_NAMES.deleteAsset]: { operation: "delete asset", method: "DELETE", path: `/v1/assets/${encodeURIComponent(assetId)}`, mutating: true },
    [TOOL_NAMES.listBrandTemplates]: { operation: "list brand templates", method: "GET", path: "/v1/brand-templates", query: compactBody({ continuation: stringParam(params, "continuation"), query: stringParam(params, "query"), brand_template_ids: arrayParam(params.brandTemplateIds).join(",") || undefined }) },
    [TOOL_NAMES.getBrandTemplate]: { operation: "get brand template", method: "GET", path: `/v1/brand-templates/${encodeURIComponent(brandTemplateId)}` },
    [TOOL_NAMES.getBrandTemplateDataset]: { operation: "get brand template dataset", method: "GET", path: `/v1/brand-templates/${encodeURIComponent(brandTemplateId)}/dataset` },
    [TOOL_NAMES.createAutofillJob]: { operation: "create autofill job", method: "POST", path: "/v1/autofills", body: compactBody({ brand_template_id: brandTemplateId, title: stringParam(params, "title") || undefined, data: jsonObject(params.data) }), mutating: true },
    [TOOL_NAMES.getAutofillJob]: { operation: "get autofill job", method: "GET", path: `/v1/autofills/${encodeURIComponent(jobId)}` },
    [TOOL_NAMES.getDesignImportJob]: { operation: "get design import job", method: "GET", path: `/v1/imports/${encodeURIComponent(jobId)}` },
    [TOOL_NAMES.createUrlImportJob]: { operation: "create URL import job", method: "POST", path: "/v1/url-imports", body: compactBody({ url: stringParam(params, "url"), title: stringParam(params, "title") || undefined }), mutating: true },
    [TOOL_NAMES.getUrlImportJob]: { operation: "get URL import job", method: "GET", path: `/v1/url-imports/${encodeURIComponent(jobId)}` },
    [TOOL_NAMES.createResizeJob]: { operation: "create resize job", method: "POST", path: "/v1/resizes", body: compactBody({ design_id: designId, target_dimensions: jsonObject(params.targetDimensions), title: stringParam(params, "title") || undefined }), mutating: true },
    [TOOL_NAMES.getResizeJob]: { operation: "get resize job", method: "GET", path: `/v1/resizes/${encodeURIComponent(jobId)}` },
    [TOOL_NAMES.createFolder]: { operation: "create folder", method: "POST", path: "/v1/folders", body: compactBody({ name: stringParam(params, "name"), parent_folder_id: stringParam(params, "parentFolderId") || undefined }), mutating: true },
    [TOOL_NAMES.getFolder]: { operation: "get folder", method: "GET", path: `/v1/folders/${encodeURIComponent(folderId)}` },
    [TOOL_NAMES.updateFolder]: { operation: "update folder", method: "PATCH", path: `/v1/folders/${encodeURIComponent(folderId)}`, body: { name: stringParam(params, "name") }, mutating: true },
    [TOOL_NAMES.deleteFolder]: { operation: "delete folder", method: "DELETE", path: `/v1/folders/${encodeURIComponent(folderId)}`, mutating: true },
    [TOOL_NAMES.listFolderItems]: { operation: "list folder items", method: "GET", path: `/v1/folders/${encodeURIComponent(folderId)}/items`, query: compactBody({ continuation: stringParam(params, "continuation") }) },
    [TOOL_NAMES.moveFolderItem]: { operation: "move folder item", method: "POST", path: "/v1/folders/move", body: { to_folder_id: stringParam(params, "toFolderId"), item_id: stringParam(params, "itemId"), item_type: stringParam(params, "itemType") }, mutating: true },
    [TOOL_NAMES.createCommentThread]: { operation: "create comment thread", method: "POST", path: `/v1/designs/${encodeURIComponent(designId)}/comments`, body: compactBody({ message: stringParam(params, "message"), assignee_id: stringParam(params, "assigneeId") || undefined }), mutating: true },
    [TOOL_NAMES.listCommentReplies]: { operation: "list comment replies", method: "GET", path: `/v1/designs/${encodeURIComponent(designId)}/comments/${encodeURIComponent(threadId)}/replies`, query: compactBody({ continuation: stringParam(params, "continuation") }) },
    [TOOL_NAMES.createCommentReply]: { operation: "create comment reply", method: "POST", path: `/v1/designs/${encodeURIComponent(designId)}/comments/${encodeURIComponent(threadId)}/replies`, body: { message: stringParam(params, "message") }, mutating: true },
  };
}

function importPlan(params: Params): CanvaRequestPlan {
  return {
    operation: "create design import job",
    method: "POST",
    path: "/v1/imports",
    headers: {
      "Import-Metadata": JSON.stringify(jsonObject(params.importMetadata)),
      "content-type": requireString(params, "mimeType"),
    },
    body: Buffer.from(requireString(params, "base64Content"), "base64"),
    mutating: true,
  };
}

function uploadBytesPlan(params: Params): CanvaRequestPlan {
  return {
    operation: "upload asset bytes",
    method: "POST",
    path: "/v1/asset-uploads",
    headers: {
      "Asset-Upload-Metadata": JSON.stringify({ name: requireString(params, "name"), tags: arrayParam(params.tags) }),
      "content-type": "application/octet-stream",
    },
    body: Buffer.from(requireString(params, "base64Content"), "base64"),
    mutating: true,
  };
}

function registerTool(ctx: PluginContext, name: string) {
  ctx.tools.register(name, { displayName: name, description: `Run ${name}`, parametersSchema: { type: "object" } }, async (rawParams, runCtx) => {
    const params = asObject(rawParams);
    if (name === TOOL_NAMES.uploadAssetBytes) {
      return executeAsyncPlan(ctx, runCtx, uploadBytesPlan(params), (payload) => {
        const id = jobIdFrom(payload);
        return id ? { operation: "get asset upload job", method: "GET", path: `/v1/asset-uploads/${encodeURIComponent(id)}` } : null;
      }, boolParam(params, "poll", false));
    }
    if (name === TOOL_NAMES.createDesignImportJob) {
      return executeAsyncPlan(ctx, runCtx, importPlan(params), (payload) => {
        const id = jobIdFrom(payload);
        return id ? { operation: "get design import job", method: "GET", path: `/v1/imports/${encodeURIComponent(id)}` } : null;
      }, boolParam(params, "poll", false));
    }
    const plan = plans(params)[name];
    if (!plan) return { error: `Unknown Canva tool: ${name}` };
    if (name === TOOL_NAMES.createExportJob) {
      return executeAsyncPlan(ctx, runCtx, plan, (payload) => {
        const id = jobIdFrom(payload);
        return id ? { operation: "get export job", method: "GET", path: `/v1/exports/${encodeURIComponent(id)}` } : null;
      }, boolParam(params, "poll", false));
    }
    if (name === TOOL_NAMES.uploadAssetFromUrl) {
      return executeAsyncPlan(ctx, runCtx, plan, (payload) => {
        const id = jobIdFrom(payload);
        return id ? { operation: "get URL asset upload job", method: "GET", path: `/v1/url-asset-uploads/${encodeURIComponent(id)}` } : null;
      }, boolParam(params, "poll", false));
    }
    if (name === TOOL_NAMES.createAutofillJob) {
      return executeAsyncPlan(ctx, runCtx, plan, (payload) => {
        const id = jobIdFrom(payload);
        return id ? { operation: "get autofill job", method: "GET", path: `/v1/autofills/${encodeURIComponent(id)}` } : null;
      }, boolParam(params, "poll", false));
    }
    if (name === TOOL_NAMES.createUrlImportJob) {
      return executeAsyncPlan(ctx, runCtx, plan, (payload) => {
        const id = jobIdFrom(payload);
        return id ? { operation: "get URL import job", method: "GET", path: `/v1/url-imports/${encodeURIComponent(id)}` } : null;
      }, boolParam(params, "poll", false));
    }
    if (name === TOOL_NAMES.createResizeJob) {
      return executeAsyncPlan(ctx, runCtx, plan, (payload) => {
        const id = jobIdFrom(payload);
        return id ? { operation: "get resize job", method: "GET", path: `/v1/resizes/${encodeURIComponent(id)}` } : null;
      }, boolParam(params, "poll", false));
    }
    return executePlan(ctx, runCtx, plan);
  });
}

const plugin = definePlugin({
  async setup(ctx) {
    for (const tool of Object.values(TOOL_NAMES)) registerTool(ctx, tool);

    ctx.data.register(DATA_KEYS.status, async (params) => {
      const { config, errors, warnings } = validateConfig(await ctx.config.get());
      const companyId = stringParam(params, "companyId");
      const companyMatches = !config.connectedCompanyId || !companyId || config.connectedCompanyId === companyId;
      return {
        version: PLUGIN_VERSION,
        connected: isConnected(config) && companyMatches,
        connectedCompanyId: config.connectedCompanyId || null,
        connectedAt: config.connectedAt || null,
        connectedUserId: config.connectedUserId || null,
        connectedDisplayName: config.connectedDisplayName || null,
        dryRun: config.dryRun,
        scopes: config.enabledScopes,
        redirectUri: config.redirectUri || null,
        errors,
        warnings: companyMatches ? warnings : [...warnings, "Canva is connected for a different PaperClaw company."],
      };
    });

    ctx.data.register(DATA_KEYS.recentCommands, async (params) => {
      const companyId = stringParam(params, "companyId");
      if (!companyId) return { commands: [] };
      const commands = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
      return { commands: Array.isArray(commands) ? commands : [] };
    });

    ctx.actions.register(ACTION_KEYS.startOauth, async (params) => {
      const config = normalizeConfig({ ...await ctx.config.get(), ...params });
      if (!config.clientId) throw new Error("Canva Client ID is required.");
      const redirectUri = stringParam(params, "redirectUri", config.redirectUri);
      if (!redirectUri) throw new Error("Redirect URI is required.");
      const codeVerifier = createCodeVerifier();
      const state = createOauthState();
      return {
        authorizationUrl: createCanvaAuthorizationUrl({
          clientId: config.clientId,
          redirectUri,
          codeVerifier,
          state,
          scopes: config.enabledScopes.length ? config.enabledScopes : [...DEFAULT_SCOPES],
        }),
        codeVerifier,
        state,
        redirectUri,
      };
    });

    ctx.actions.register(ACTION_KEYS.saveClientSecret, async (params) => {
      const companyId = requireString(params, "companyId");
      const value = requireString(params, "clientSecret");
      return ctx.secrets.upsert({
        companyId,
        name: "canva-client-secret",
        value,
        description: "Canva OAuth client secret for the Canva plugin.",
      });
    });

    ctx.actions.register(ACTION_KEYS.completeOauth, async (params) => {
      const config = normalizeConfig({ ...await ctx.config.get(), ...params });
      if (!config.clientSecretRef) throw new Error("Canva Client Secret Reference is required.");
      const client = new CanvaClient(ctx, config);
      const token = await client.exchangeCode({
        code: requireString(params, "code"),
        codeVerifier: requireString(params, "codeVerifier"),
        redirectUri: requireString(params, "redirectUri"),
      });
      if (!token.refresh_token) throw new Error("Canva did not return a refresh token.");
      const secret = await ctx.secrets.upsert({
        companyId: requireString(params, "companyId"),
        name: "canva-refresh-token",
        value: token.refresh_token,
        description: "Canva OAuth refresh token for the Canva plugin.",
      });
      return {
        refreshTokenSecretRef: secret.secretRef,
        expiresIn: token.expires_in ?? null,
        scope: token.scope ?? "",
        tokenType: token.token_type ?? "Bearer",
      };
    });

    ctx.actions.register(ACTION_KEYS.disconnect, async (params) => {
      const companyId = stringParam(params, "companyId");
      if (companyId) {
        await ctx.state.delete({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
      }
      return { ok: true };
    });
  },

  async onValidateConfig(config) {
    const validation = validateConfig(config);
    return {
      ok: validation.errors.length === 0,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
