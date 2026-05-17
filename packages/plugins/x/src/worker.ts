import { definePlugin, runWorker, type PluginContext, type ToolResult, type ToolRunContext } from "@kesarcloud/plugin-sdk";
import { ACTION_KEYS, DATA_KEYS, DEFAULT_SCOPES, PLUGIN_VERSION, TOOL_NAMES } from "./constants.js";
import { createCodeVerifier, createOauthState, createXAuthorizationUrl } from "./oauth.js";
import { XClient, isConnected, normalizeConfig, summarizeResult, validateConfig, type XConfig, type XRequestPlan } from "./x-client.js";

type Params = Record<string, unknown>;

const COMMAND_HISTORY_KEY = "recent-commands";
const DEFAULT_TWEET_FIELDS = ["id", "text", "created_at", "author_id", "conversation_id", "public_metrics", "referenced_tweets"];
const DEFAULT_USER_FIELDS = ["id", "name", "username", "verified", "description", "public_metrics", "profile_image_url"];

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

function numberParam(params: Params, key: string, fallback?: number) {
  const value = typeof params[key] === "number" ? params[key] as number : Number.parseInt(String(params[key] ?? ""), 10);
  return Number.isFinite(value) ? Math.floor(value) : fallback;
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

function stringArrayParam(params: Params, key: string, fallback: string[] = []) {
  const value = params[key];
  if (!Array.isArray(value)) return fallback;
  return value.map((entry) => String(entry).trim()).filter(Boolean);
}

function compactBody(value: Params) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== "" && item !== null));
}

function csv(values: string[]) {
  return values.length ? values.join(",") : undefined;
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

function assertCompanyConnected(config: XConfig, companyId: string) {
  if (!isConnected(config)) throw new Error("X is not connected.");
  if (config.connectedCompanyId && config.connectedCompanyId !== companyId) {
    throw new Error("X is connected for a different PaperClaw company.");
  }
}

function connectedUserId(config: XConfig, params: Params) {
  const userId = stringParam(params, "userId", config.connectedUserId);
  if (!userId) throw new Error("userId is required because the connected X user ID is not configured.");
  return userId;
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

async function audit(ctx: PluginContext, runCtx: ToolRunContext, plan: XRequestPlan, result: { ok: boolean; dryRun: boolean }) {
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
    message: `X ${result.dryRun ? "dry-run" : "request"}: ${plan.operation}`,
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

async function executePlan(ctx: PluginContext, runCtx: ToolRunContext, plan: XRequestPlan): Promise<ToolResult> {
  const config = await getConfig(ctx);
  assertCompanyConnected(config, runCtx.companyId);

  if (config.dryRun && plan.mutating) {
    await audit(ctx, runCtx, plan, { ok: true, dryRun: true });
    return {
      content: `Dry run prepared for X: ${plan.operation}. X was not changed.`,
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
    const client = new XClient(ctx, config);
    const response = await client.request(plan, runCtx.companyId);
    await audit(ctx, runCtx, plan, { ok: true, dryRun: false });
    return {
      content: `X request completed: ${plan.operation}.`,
      data: summarizeResult(response),
    };
  } catch (error) {
    await audit(ctx, runCtx, plan, { ok: false, dryRun: false });
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

async function pollMediaStatus(client: XClient, companyId: string, mediaId: string, attempts: number) {
  let current = await client.request(mediaStatusPlan(mediaId), companyId);
  for (let index = 1; index < attempts; index += 1) {
    const state = (current.payload as { data?: { processing_info?: { state?: string } } } | null)?.data?.processing_info?.state;
    if (!state || state === "succeeded" || state === "failed") break;
    await new Promise((resolve) => setTimeout(resolve, 750));
    current = await client.request(mediaStatusPlan(mediaId), companyId);
  }
  return current;
}

async function executeFinalizeMedia(ctx: PluginContext, runCtx: ToolRunContext, plan: XRequestPlan, mediaId: string, poll: boolean): Promise<ToolResult> {
  const config = await getConfig(ctx);
  assertCompanyConnected(config, runCtx.companyId);
  if (config.dryRun) {
    await audit(ctx, runCtx, plan, { ok: true, dryRun: true });
    return { content: `Dry run prepared for X: ${plan.operation}. X was not changed.`, data: { ...plan, dryRun: true } };
  }
  try {
    const client = new XClient(ctx, config);
    const finalized = await client.request(plan, runCtx.companyId);
    const final = poll ? await pollMediaStatus(client, runCtx.companyId, mediaId, config.maxPollAttempts) : finalized;
    await audit(ctx, runCtx, plan, { ok: true, dryRun: false });
    return { content: `X request completed: ${plan.operation}.`, data: { finalized: summarizeResult(finalized), final: summarizeResult(final) } };
  } catch (error) {
    await audit(ctx, runCtx, plan, { ok: false, dryRun: false });
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function commonQuery(params: Params) {
  return compactBody({
    "tweet.fields": csv(stringArrayParam(params, "tweetFields", DEFAULT_TWEET_FIELDS)),
    "user.fields": csv(stringArrayParam(params, "userFields", DEFAULT_USER_FIELDS)),
    expansions: csv(stringArrayParam(params, "expansions")),
  });
}

function paginationQuery(params: Params) {
  return compactBody({
    max_results: numberParam(params, "maxResults"),
    pagination_token: stringParam(params, "paginationToken"),
    ...commonQuery(params),
  });
}

function postBody(params: Params) {
  const rawBody = jsonObject(params.rawBody);
  if (Object.keys(rawBody).length) return rawBody;
  const mediaIds = arrayParam(params.mediaIds).map(String).filter(Boolean);
  return compactBody({
    text: stringParam(params, "text"),
    media: mediaIds.length ? { media_ids: mediaIds } : undefined,
    poll: Object.keys(jsonObject(params.poll)).length ? jsonObject(params.poll) : undefined,
    reply: Object.keys(jsonObject(params.reply)).length ? jsonObject(params.reply) : undefined,
    quote_tweet_id: stringParam(params, "quoteTweetId") || undefined,
    reply_settings: stringParam(params, "replySettings") || undefined,
    made_with_ai: typeof params.madeWithAi === "boolean" ? params.madeWithAi : undefined,
  });
}

function mediaStatusPlan(mediaId: string): XRequestPlan {
  return {
    operation: "get media upload status",
    method: "GET",
    path: "/2/media/upload",
    query: { media_id: mediaId, command: "STATUS" },
  };
}

function planFor(name: string, params: Params, config: XConfig): XRequestPlan {
  const userId = stringParam(params, "userId");
  const defaultUserId = () => connectedUserId(config, params);
  const postId = stringParam(params, "postId") || stringParam(params, "tweetId");
  const targetUserId = stringParam(params, "targetUserId");
  const listId = stringParam(params, "listId");
  const mediaId = stringParam(params, "mediaId");

  if (name === TOOL_NAMES.getCurrentUser) return { operation: "get current user", method: "GET", path: "/2/users/me", query: { "user.fields": csv(DEFAULT_USER_FIELDS) } };
  if (name === TOOL_NAMES.getUser) return { operation: "get user", method: "GET", path: `/2/users/${encodeURIComponent(requireString(params, "userId"))}`, query: commonQuery(params) };
  if (name === TOOL_NAMES.getUserByUsername) return { operation: "get user by username", method: "GET", path: `/2/users/by/username/${encodeURIComponent(requireString(params, "username"))}`, query: commonQuery(params) };
  if (name === TOOL_NAMES.getPost) return { operation: "get post", method: "GET", path: `/2/tweets/${encodeURIComponent(requireString({ postId }, "postId"))}`, query: commonQuery(params) };
  if (name === TOOL_NAMES.lookupPosts) return { operation: "lookup posts", method: "GET", path: "/2/tweets", query: { ids: arrayParam(params.postIds).map(String).join(","), ...commonQuery(params) } };
  if (name === TOOL_NAMES.searchRecentPosts) return { operation: "search recent posts", method: "GET", path: "/2/tweets/search/recent", query: compactBody({ query: requireString(params, "query"), max_results: numberParam(params, "maxResults"), next_token: stringParam(params, "nextToken"), ...commonQuery(params) }) };
  if (name === TOOL_NAMES.listUserPosts) return { operation: "list user posts", method: "GET", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/tweets`, query: paginationQuery(params) };
  if (name === TOOL_NAMES.listUserMentions) return { operation: "list user mentions", method: "GET", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/mentions`, query: paginationQuery(params) };
  if (name === TOOL_NAMES.createPost) return { operation: "create post", method: "POST", path: "/2/tweets", body: postBody(params), mutating: true };
  if (name === TOOL_NAMES.deletePost) return { operation: "delete post", method: "DELETE", path: `/2/tweets/${encodeURIComponent(requireString({ postId }, "postId"))}`, mutating: true };
  if (name === TOOL_NAMES.repostPost) return { operation: "repost post", method: "POST", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/retweets`, body: { tweet_id: requireString({ postId }, "postId") }, mutating: true };
  if (name === TOOL_NAMES.undoRepost) return { operation: "undo repost", method: "DELETE", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/retweets/${encodeURIComponent(requireString({ postId }, "postId"))}`, mutating: true };
  if (name === TOOL_NAMES.likePost) return { operation: "like post", method: "POST", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/likes`, body: { tweet_id: requireString({ postId }, "postId") }, mutating: true };
  if (name === TOOL_NAMES.unlikePost) return { operation: "unlike post", method: "DELETE", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/likes/${encodeURIComponent(requireString({ postId }, "postId"))}`, mutating: true };
  if (name === TOOL_NAMES.listLikedPosts) return { operation: "list liked posts", method: "GET", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/liked_tweets`, query: paginationQuery(params) };
  if (name === TOOL_NAMES.bookmarkPost) return { operation: "bookmark post", method: "POST", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/bookmarks`, body: { tweet_id: requireString({ postId }, "postId") }, mutating: true };
  if (name === TOOL_NAMES.removeBookmark) return { operation: "remove bookmark", method: "DELETE", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/bookmarks/${encodeURIComponent(requireString({ postId }, "postId"))}`, mutating: true };
  if (name === TOOL_NAMES.listBookmarks) return { operation: "list bookmarks", method: "GET", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/bookmarks`, query: paginationQuery(params) };
  if (name === TOOL_NAMES.listFollowers) return { operation: "list followers", method: "GET", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/followers`, query: paginationQuery(params) };
  if (name === TOOL_NAMES.listFollowing) return { operation: "list following", method: "GET", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/following`, query: paginationQuery(params) };
  if (name === TOOL_NAMES.followUser) return { operation: "follow user", method: "POST", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/following`, body: { target_user_id: requireString({ targetUserId }, "targetUserId") }, mutating: true };
  if (name === TOOL_NAMES.unfollowUser) return { operation: "unfollow user", method: "DELETE", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/following/${encodeURIComponent(requireString({ targetUserId }, "targetUserId"))}`, mutating: true };
  if (name === TOOL_NAMES.listOwnedLists) return { operation: "list owned lists", method: "GET", path: `/2/users/${encodeURIComponent(userId || defaultUserId())}/owned_lists`, query: paginationQuery(params) };
  if (name === TOOL_NAMES.createList) return { operation: "create list", method: "POST", path: "/2/lists", body: compactBody({ name: requireString(params, "name"), description: stringParam(params, "description") || undefined, private: typeof params.private === "boolean" ? params.private : undefined }), mutating: true };
  if (name === TOOL_NAMES.getList) return { operation: "get list", method: "GET", path: `/2/lists/${encodeURIComponent(requireString({ listId }, "listId"))}` };
  if (name === TOOL_NAMES.updateList) return { operation: "update list", method: "PUT", path: `/2/lists/${encodeURIComponent(requireString({ listId }, "listId"))}`, body: compactBody({ name: stringParam(params, "name") || undefined, description: stringParam(params, "description") || undefined, private: typeof params.private === "boolean" ? params.private : undefined }), mutating: true };
  if (name === TOOL_NAMES.deleteList) return { operation: "delete list", method: "DELETE", path: `/2/lists/${encodeURIComponent(requireString({ listId }, "listId"))}`, mutating: true };
  if (name === TOOL_NAMES.addListMember) return { operation: "add list member", method: "POST", path: `/2/lists/${encodeURIComponent(requireString({ listId }, "listId"))}/members`, body: { user_id: requireString(params, "userId") }, mutating: true };
  if (name === TOOL_NAMES.removeListMember) return { operation: "remove list member", method: "DELETE", path: `/2/lists/${encodeURIComponent(requireString({ listId }, "listId"))}/members/${encodeURIComponent(requireString(params, "userId"))}`, mutating: true };
  if (name === TOOL_NAMES.listListPosts) return { operation: "list list posts", method: "GET", path: `/2/lists/${encodeURIComponent(requireString({ listId }, "listId"))}/tweets`, query: paginationQuery(params) };
  if (name === TOOL_NAMES.initializeMediaUpload) return { operation: "initialize media upload", method: "POST", path: "/2/media/upload/initialize", body: compactBody({ total_bytes: numberParam(params, "totalBytes"), media_type: requireString(params, "mediaType"), media_category: stringParam(params, "mediaCategory") || undefined, shared: typeof params.shared === "boolean" ? params.shared : undefined, additional_owners: arrayParam(params.additionalOwners).length ? arrayParam(params.additionalOwners).map(String) : undefined }), mutating: true };
  if (name === TOOL_NAMES.appendMediaUpload) return { operation: "append media upload", method: "POST", path: `/2/media/upload/${encodeURIComponent(requireString({ mediaId }, "mediaId"))}/append`, body: { media: requireString(params, "base64Content"), segment_index: numberParam(params, "segmentIndex", 0) }, mutating: true };
  if (name === TOOL_NAMES.finalizeMediaUpload) return { operation: "finalize media upload", method: "POST", path: `/2/media/upload/${encodeURIComponent(requireString({ mediaId }, "mediaId"))}/finalize`, mutating: true };
  if (name === TOOL_NAMES.getMediaUploadStatus) return mediaStatusPlan(requireString({ mediaId }, "mediaId"));
  if (name === TOOL_NAMES.listDmEvents) return { operation: "list direct-message events", method: "GET", path: "/2/dm_events", query: compactBody({ max_results: numberParam(params, "maxResults"), pagination_token: stringParam(params, "paginationToken") }) };
  if (name === TOOL_NAMES.sendDmToUser) return { operation: "send direct message to user", method: "POST", path: `/2/dm_conversations/with/${encodeURIComponent(requireString(params, "participantId"))}/messages`, body: compactBody({ text: requireString(params, "text"), attachments: arrayParam(params.attachments).length ? arrayParam(params.attachments) : undefined }), mutating: true };
  if (name === TOOL_NAMES.apiRequest) {
    const method = requireString(params, "method").toUpperCase();
    if (!["GET", "POST", "PUT", "DELETE"].includes(method)) throw new Error("method must be GET, POST, PUT, or DELETE");
    const path = requireString(params, "path");
    if (!path.startsWith("/2/")) throw new Error("path must start with /2/");
    return {
      operation: "custom X API request",
      method: method as XRequestPlan["method"],
      path,
      query: jsonObject(params.query),
      body: method === "GET" ? undefined : jsonObject(params.body),
      mutating: method !== "GET",
    };
  }
  throw new Error(`Unknown X tool: ${name}`);
}

function registerTool(ctx: PluginContext, name: string) {
  ctx.tools.register(name, { displayName: name, description: `Run ${name}`, parametersSchema: { type: "object" } }, async (rawParams, runCtx) => {
    const params = asObject(rawParams);
    const config = await getConfig(ctx);
    let plan: XRequestPlan;
    try {
      plan = planFor(name, params, config);
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
    if (name === TOOL_NAMES.finalizeMediaUpload) {
      return executeFinalizeMedia(ctx, runCtx, plan, requireString(params, "mediaId"), boolParam(params, "poll", false));
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
        connectedUsername: config.connectedUsername || null,
        connectedDisplayName: config.connectedDisplayName || null,
        dryRun: config.dryRun,
        scopes: config.enabledScopes,
        redirectUri: config.redirectUri || null,
        errors,
        warnings: companyMatches ? warnings : [...warnings, "X is connected for a different PaperClaw company."],
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
      if (!config.clientId) throw new Error("X Client ID is required.");
      const redirectUri = stringParam(params, "redirectUri", config.redirectUri);
      if (!redirectUri) throw new Error("Redirect URI is required.");
      const codeVerifier = createCodeVerifier();
      const state = createOauthState();
      return {
        authorizationUrl: createXAuthorizationUrl({
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
        name: "x-client-secret",
        value,
        description: "X OAuth client secret for the X plugin.",
      });
    });

    ctx.actions.register(ACTION_KEYS.completeOauth, async (params) => {
      const companyId = requireString(params, "companyId");
      const config = normalizeConfig({ ...await ctx.config.get(), ...params });
      if (!config.clientSecretRef) throw new Error("X Client Secret Reference is required.");
      const client = new XClient(ctx, config);
      const token = await client.exchangeCode({
        code: requireString(params, "code"),
        codeVerifier: requireString(params, "codeVerifier"),
        redirectUri: requireString(params, "redirectUri"),
      });
      if (!token.refresh_token) throw new Error("X did not return a refresh token. Make sure the app requested the offline.access scope.");
      const secret = await ctx.secrets.upsert({
        companyId,
        name: "x-refresh-token",
        value: token.refresh_token,
        description: "X OAuth refresh token for the X plugin.",
      });
      const user = token.access_token
        ? await client.requestWithAccessToken({ operation: "get current user", method: "GET", path: "/2/users/me", query: { "user.fields": csv(DEFAULT_USER_FIELDS) } }, token.access_token)
        : null;
      const data = user?.payload && typeof user.payload === "object" ? (user.payload as { data?: { id?: string; name?: string; username?: string } }).data : undefined;
      return {
        refreshTokenSecretRef: secret.secretRef,
        connectedUserId: data?.id ?? "",
        connectedUsername: data?.username ?? "",
        connectedDisplayName: data?.name ?? "",
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
