export const PLUGIN_ID = "paperclaw.x";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "x";

export const EXPORT_NAMES = {
  page: "XPage",
  settingsPage: "XSettingsPage",
  dashboardWidget: "XDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "x-page",
  settingsPage: "x-settings-page",
  dashboardWidget: "x-dashboard-widget",
} as const;

export const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const ACTION_KEYS = {
  startOauth: "start-oauth",
  saveClientSecret: "save-client-secret",
  completeOauth: "complete-oauth",
  disconnect: "disconnect",
} as const;

export const TOOL_NAMES = {
  getCurrentUser: "x.getCurrentUser",
  getUser: "x.getUser",
  getUserByUsername: "x.getUserByUsername",
  getPost: "x.getPost",
  lookupPosts: "x.lookupPosts",
  searchRecentPosts: "x.searchRecentPosts",
  listUserPosts: "x.listUserPosts",
  listUserMentions: "x.listUserMentions",
  createPost: "x.createPost",
  deletePost: "x.deletePost",
  repostPost: "x.repostPost",
  undoRepost: "x.undoRepost",
  likePost: "x.likePost",
  unlikePost: "x.unlikePost",
  listLikedPosts: "x.listLikedPosts",
  bookmarkPost: "x.bookmarkPost",
  removeBookmark: "x.removeBookmark",
  listBookmarks: "x.listBookmarks",
  listFollowers: "x.listFollowers",
  listFollowing: "x.listFollowing",
  followUser: "x.followUser",
  unfollowUser: "x.unfollowUser",
  listOwnedLists: "x.listOwnedLists",
  createList: "x.createList",
  getList: "x.getList",
  updateList: "x.updateList",
  deleteList: "x.deleteList",
  addListMember: "x.addListMember",
  removeListMember: "x.removeListMember",
  listListPosts: "x.listListPosts",
  initializeMediaUpload: "x.initializeMediaUpload",
  appendMediaUpload: "x.appendMediaUpload",
  finalizeMediaUpload: "x.finalizeMediaUpload",
  getMediaUploadStatus: "x.getMediaUploadStatus",
  listDmEvents: "x.listDmEvents",
  sendDmToUser: "x.sendDmToUser",
  apiRequest: "x.apiRequest",
} as const;

export const DEFAULT_SCOPES = [
  "offline.access",
  "users.read",
  "tweet.read",
  "tweet.write",
  "media.write",
  "follows.read",
  "follows.write",
  "like.read",
  "like.write",
  "bookmark.read",
  "bookmark.write",
  "list.read",
  "list.write",
  "dm.read",
  "dm.write",
] as const;

export const DEFAULT_CONFIG = {
  clientId: "",
  clientSecretRef: "",
  refreshTokenSecretRef: "",
  connectedCompanyId: "",
  connectedAt: "",
  connectedUserId: "",
  connectedUsername: "",
  connectedDisplayName: "",
  redirectUri: "",
  enabledScopes: [...DEFAULT_SCOPES],
  dryRun: true,
  maxPollAttempts: 8,
  requestTimeoutMs: 30_000,
} as const;
