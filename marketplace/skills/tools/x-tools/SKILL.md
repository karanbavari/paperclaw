---
name: x-tools
description: Use the PaperClaw X plugin to let agents read and operate X API v2 through OAuth-backed tools.
---

# X Tools

Use this skill when a marketplace micro-service agent needs to connect a
PaperClaw company to X.

## Setup

1. Install and enable the `@kesarcloud/plugin-x` plugin.
2. Open the plugin settings page in PaperClaw.
3. Enter the X Developer Portal OAuth 2.0 Client ID and Client Secret.
4. Confirm the redirect URI shown by PaperClaw is registered exactly in the X
   app settings.
5. Complete the OAuth flow. The plugin stores client and refresh tokens in
   PaperClaw secrets.

The plugin starts in dry-run mode. Keep it enabled until a board operator is
ready for live mutating actions.

## Agent Tool Groups

- Identity and users: `x.getCurrentUser`, `x.getUser`, `x.getUserByUsername`.
- Posts and search: `x.getPost`, `x.lookupPosts`, `x.searchRecentPosts`,
  `x.listUserPosts`, `x.listUserMentions`.
- Publishing: `x.createPost`, `x.deletePost`, `x.repostPost`,
  `x.undoRepost`.
- Engagement: `x.likePost`, `x.unlikePost`, `x.bookmarkPost`,
  `x.removeBookmark`, `x.listBookmarks`, `x.listLikedPosts`.
- Audience: `x.listFollowers`, `x.listFollowing`, `x.followUser`,
  `x.unfollowUser`.
- Lists: `x.listOwnedLists`, `x.createList`, `x.getList`, `x.updateList`,
  `x.deleteList`, `x.addListMember`, `x.removeListMember`,
  `x.listListPosts`.
- Media: `x.initializeMediaUpload`, `x.appendMediaUpload`,
  `x.finalizeMediaUpload`, `x.getMediaUploadStatus`.
- Direct messages: `x.listDmEvents`, `x.sendDmToUser`.
- Advanced fallback: `x.apiRequest` for X API v2 paths under `/2/*`.

All mutating tools honor the plugin-level dry-run setting and write PaperClaw
activity/audit entries.
