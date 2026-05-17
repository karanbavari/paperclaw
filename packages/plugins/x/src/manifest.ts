import type { PaperClawPluginManifestV1 } from "@kesarcloud/plugin-sdk";
import {
  DEFAULT_CONFIG,
  DEFAULT_SCOPES,
  EXPORT_NAMES,
  PAGE_ROUTE,
  PLUGIN_ID,
  PLUGIN_VERSION,
  SLOT_IDS,
  TOOL_NAMES,
} from "./constants.js";

const stringParam = { type: "string" } as const;
const numberParam = { type: "number" } as const;
const booleanParam = { type: "boolean" } as const;
const objectParam = { type: "object" } as const;
const arrayParam = { type: "array" } as const;

const manifest: PaperClawPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "X",
  description: "Connects PaperClaw agents to X API v2 for posts, search, users, media uploads, follows, likes, bookmarks, lists, and direct messages.",
  author: "PaperClaw",
  categories: ["connector", "automation", "workspace"],
  capabilities: [
    "http.outbound",
    "secrets.read-ref",
    "secrets.write-ref",
    "agent.tools.register",
    "plugin.state.read",
    "plugin.state.write",
    "activity.log.write",
    "instance.settings.register",
    "ui.page.register",
    "ui.dashboardWidget.register",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  instanceConfigSchema: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        title: "X Client ID",
        default: DEFAULT_CONFIG.clientId,
        description: "Client ID from your X Developer Portal app.",
      },
      clientSecretRef: {
        type: "string",
        format: "secret-ref",
        title: "X Client Secret Reference",
        default: DEFAULT_CONFIG.clientSecretRef,
        description: "PaperClaw secret reference containing the X OAuth client secret.",
      },
      refreshTokenSecretRef: {
        type: "string",
        format: "secret-ref",
        title: "X Refresh Token Secret Reference",
        default: DEFAULT_CONFIG.refreshTokenSecretRef,
        description: "PaperClaw secret reference created by the X OAuth setup flow.",
      },
      connectedCompanyId: {
        type: "string",
        title: "Connected Company ID",
        default: DEFAULT_CONFIG.connectedCompanyId,
      },
      connectedAt: {
        type: "string",
        title: "Connected At",
        default: DEFAULT_CONFIG.connectedAt,
      },
      connectedUserId: {
        type: "string",
        title: "Connected X User ID",
        default: DEFAULT_CONFIG.connectedUserId,
      },
      connectedUsername: {
        type: "string",
        title: "Connected X Username",
        default: DEFAULT_CONFIG.connectedUsername,
      },
      connectedDisplayName: {
        type: "string",
        title: "Connected X User",
        default: DEFAULT_CONFIG.connectedDisplayName,
      },
      redirectUri: {
        type: "string",
        title: "Redirect URI",
        default: DEFAULT_CONFIG.redirectUri,
        description: "X OAuth redirect URI. Add this exact URL in the X Developer Portal.",
      },
      enabledScopes: {
        type: "array",
        title: "Enabled OAuth Scopes",
        default: DEFAULT_CONFIG.enabledScopes,
        items: { type: "string", enum: [...DEFAULT_SCOPES] },
      },
      dryRun: {
        type: "boolean",
        title: "Dry Run",
        default: DEFAULT_CONFIG.dryRun,
        description: "When enabled, mutating X tools return the planned request without changing X.",
      },
      maxPollAttempts: {
        type: "number",
        title: "Max Poll Attempts",
        default: DEFAULT_CONFIG.maxPollAttempts,
        minimum: 1,
        maximum: 30,
      },
      requestTimeoutMs: {
        type: "number",
        title: "Request Timeout Milliseconds",
        default: DEFAULT_CONFIG.requestTimeoutMs,
        minimum: 5000,
        maximum: 120000,
      },
    },
  },
  tools: [
    { name: TOOL_NAMES.getCurrentUser, displayName: "X Current User", description: "Return the connected X user identity.", parametersSchema: { type: "object", properties: {} } },
    { name: TOOL_NAMES.getUser, displayName: "Get X User", description: "Return a user by X user ID.", parametersSchema: { type: "object", properties: { userId: stringParam, userFields: arrayParam, expansions: arrayParam }, required: ["userId"] } },
    { name: TOOL_NAMES.getUserByUsername, displayName: "Get X User By Username", description: "Return a user by username.", parametersSchema: { type: "object", properties: { username: stringParam, userFields: arrayParam, expansions: arrayParam }, required: ["username"] } },
    { name: TOOL_NAMES.getPost, displayName: "Get X Post", description: "Return a post by ID.", parametersSchema: { type: "object", properties: { postId: stringParam, tweetFields: arrayParam, expansions: arrayParam } } },
    { name: TOOL_NAMES.lookupPosts, displayName: "Lookup X Posts", description: "Return multiple posts by IDs.", parametersSchema: { type: "object", properties: { postIds: arrayParam, tweetFields: arrayParam, expansions: arrayParam }, required: ["postIds"] } },
    { name: TOOL_NAMES.searchRecentPosts, displayName: "Search Recent X Posts", description: "Search recent public posts.", parametersSchema: { type: "object", properties: { query: stringParam, maxResults: numberParam, nextToken: stringParam, tweetFields: arrayParam, userFields: arrayParam, expansions: arrayParam }, required: ["query"] } },
    { name: TOOL_NAMES.listUserPosts, displayName: "List User X Posts", description: "List posts from a user timeline.", parametersSchema: { type: "object", properties: { userId: stringParam, maxResults: numberParam, paginationToken: stringParam, tweetFields: arrayParam, expansions: arrayParam } } },
    { name: TOOL_NAMES.listUserMentions, displayName: "List X Mentions", description: "List mentions for a user.", parametersSchema: { type: "object", properties: { userId: stringParam, maxResults: numberParam, paginationToken: stringParam, tweetFields: arrayParam, expansions: arrayParam } } },
    { name: TOOL_NAMES.createPost, displayName: "Create X Post", description: "Create or edit a post.", parametersSchema: { type: "object", properties: { text: stringParam, mediaIds: arrayParam, poll: objectParam, reply: objectParam, quoteTweetId: stringParam, replySettings: stringParam, madeWithAi: booleanParam, rawBody: objectParam }, required: ["text"] } },
    { name: TOOL_NAMES.deletePost, displayName: "Delete X Post", description: "Delete a post by ID.", parametersSchema: { type: "object", properties: { postId: stringParam }, required: ["postId"] } },
    { name: TOOL_NAMES.repostPost, displayName: "Repost X Post", description: "Repost a post as the connected user.", parametersSchema: { type: "object", properties: { userId: stringParam, postId: stringParam }, required: ["postId"] } },
    { name: TOOL_NAMES.undoRepost, displayName: "Undo X Repost", description: "Remove a repost.", parametersSchema: { type: "object", properties: { userId: stringParam, postId: stringParam }, required: ["postId"] } },
    { name: TOOL_NAMES.likePost, displayName: "Like X Post", description: "Like a post.", parametersSchema: { type: "object", properties: { userId: stringParam, postId: stringParam }, required: ["postId"] } },
    { name: TOOL_NAMES.unlikePost, displayName: "Unlike X Post", description: "Remove a post like.", parametersSchema: { type: "object", properties: { userId: stringParam, postId: stringParam }, required: ["postId"] } },
    { name: TOOL_NAMES.listLikedPosts, displayName: "List Liked X Posts", description: "List posts liked by a user.", parametersSchema: { type: "object", properties: { userId: stringParam, maxResults: numberParam, paginationToken: stringParam } } },
    { name: TOOL_NAMES.bookmarkPost, displayName: "Bookmark X Post", description: "Bookmark a post.", parametersSchema: { type: "object", properties: { userId: stringParam, postId: stringParam }, required: ["postId"] } },
    { name: TOOL_NAMES.removeBookmark, displayName: "Remove X Bookmark", description: "Remove a post bookmark.", parametersSchema: { type: "object", properties: { userId: stringParam, postId: stringParam }, required: ["postId"] } },
    { name: TOOL_NAMES.listBookmarks, displayName: "List X Bookmarks", description: "List user bookmarks.", parametersSchema: { type: "object", properties: { userId: stringParam, maxResults: numberParam, paginationToken: stringParam } } },
    { name: TOOL_NAMES.listFollowers, displayName: "List X Followers", description: "List followers for a user.", parametersSchema: { type: "object", properties: { userId: stringParam, maxResults: numberParam, paginationToken: stringParam } } },
    { name: TOOL_NAMES.listFollowing, displayName: "List X Following", description: "List accounts a user follows.", parametersSchema: { type: "object", properties: { userId: stringParam, maxResults: numberParam, paginationToken: stringParam } } },
    { name: TOOL_NAMES.followUser, displayName: "Follow X User", description: "Follow a target user.", parametersSchema: { type: "object", properties: { userId: stringParam, targetUserId: stringParam }, required: ["targetUserId"] } },
    { name: TOOL_NAMES.unfollowUser, displayName: "Unfollow X User", description: "Unfollow a target user.", parametersSchema: { type: "object", properties: { userId: stringParam, targetUserId: stringParam }, required: ["targetUserId"] } },
    { name: TOOL_NAMES.listOwnedLists, displayName: "List Owned X Lists", description: "List lists owned by a user.", parametersSchema: { type: "object", properties: { userId: stringParam, maxResults: numberParam, paginationToken: stringParam } } },
    { name: TOOL_NAMES.createList, displayName: "Create X List", description: "Create a list.", parametersSchema: { type: "object", properties: { name: stringParam, description: stringParam, private: booleanParam }, required: ["name"] } },
    { name: TOOL_NAMES.getList, displayName: "Get X List", description: "Get a list by ID.", parametersSchema: { type: "object", properties: { listId: stringParam }, required: ["listId"] } },
    { name: TOOL_NAMES.updateList, displayName: "Update X List", description: "Update a list.", parametersSchema: { type: "object", properties: { listId: stringParam, name: stringParam, description: stringParam, private: booleanParam }, required: ["listId"] } },
    { name: TOOL_NAMES.deleteList, displayName: "Delete X List", description: "Delete a list.", parametersSchema: { type: "object", properties: { listId: stringParam }, required: ["listId"] } },
    { name: TOOL_NAMES.addListMember, displayName: "Add X List Member", description: "Add a user to a list.", parametersSchema: { type: "object", properties: { listId: stringParam, userId: stringParam }, required: ["listId", "userId"] } },
    { name: TOOL_NAMES.removeListMember, displayName: "Remove X List Member", description: "Remove a user from a list.", parametersSchema: { type: "object", properties: { listId: stringParam, userId: stringParam }, required: ["listId", "userId"] } },
    { name: TOOL_NAMES.listListPosts, displayName: "List X List Posts", description: "List posts in a list.", parametersSchema: { type: "object", properties: { listId: stringParam, maxResults: numberParam, paginationToken: stringParam }, required: ["listId"] } },
    { name: TOOL_NAMES.initializeMediaUpload, displayName: "Initialize X Media Upload", description: "Start a media upload.", parametersSchema: { type: "object", properties: { totalBytes: numberParam, mediaType: stringParam, mediaCategory: stringParam, shared: booleanParam, additionalOwners: arrayParam }, required: ["totalBytes", "mediaType"] } },
    { name: TOOL_NAMES.appendMediaUpload, displayName: "Append X Media Upload", description: "Append a base64 media segment.", parametersSchema: { type: "object", properties: { mediaId: stringParam, base64Content: stringParam, segmentIndex: numberParam }, required: ["mediaId", "base64Content", "segmentIndex"] } },
    { name: TOOL_NAMES.finalizeMediaUpload, displayName: "Finalize X Media Upload", description: "Finalize a media upload.", parametersSchema: { type: "object", properties: { mediaId: stringParam, poll: booleanParam }, required: ["mediaId"] } },
    { name: TOOL_NAMES.getMediaUploadStatus, displayName: "Get X Media Upload Status", description: "Get media upload processing status.", parametersSchema: { type: "object", properties: { mediaId: stringParam }, required: ["mediaId"] } },
    { name: TOOL_NAMES.listDmEvents, displayName: "List X DM Events", description: "List direct-message events.", parametersSchema: { type: "object", properties: { maxResults: numberParam, paginationToken: stringParam } } },
    { name: TOOL_NAMES.sendDmToUser, displayName: "Send X DM", description: "Send a direct message to a user.", parametersSchema: { type: "object", properties: { participantId: stringParam, text: stringParam, attachments: arrayParam }, required: ["participantId", "text"] } },
    { name: TOOL_NAMES.apiRequest, displayName: "X API Request", description: "Call an X API v2 endpoint under /2/*.", parametersSchema: { type: "object", properties: { method: stringParam, path: stringParam, query: objectParam, body: objectParam }, required: ["method", "path"] } },
  ],
  ui: {
    slots: [
      {
        type: "page",
        id: SLOT_IDS.page,
        displayName: "X",
        exportName: EXPORT_NAMES.page,
        routePath: PAGE_ROUTE,
      },
      {
        type: "settingsPage",
        id: SLOT_IDS.settingsPage,
        displayName: "X",
        exportName: EXPORT_NAMES.settingsPage,
      },
      {
        type: "dashboardWidget",
        id: SLOT_IDS.dashboardWidget,
        displayName: "X",
        exportName: EXPORT_NAMES.dashboardWidget,
      },
    ],
    launchers: [
      {
        id: "x-page",
        displayName: "X",
        placementZone: "sidebar",
        action: {
          type: "navigate",
          target: PAGE_ROUTE,
        },
      },
    ],
  },
};

export default manifest;
