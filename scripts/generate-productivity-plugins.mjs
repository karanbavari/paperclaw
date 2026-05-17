import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();

const commonDevDeps = `{
    "@types/node": "^24.6.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "react": "^19.0.8",
    "react-dom": "^19.0.8",
    "typescript": "^5.7.3",
    "vitest": "^3.2.4"
  }`;

const plugins = [
  {
    slug: "notion",
    displayName: "Notion",
    description: "Connects PaperClaw agents to Notion workspaces for pages, databases, blocks, comments, and search.",
    apiBaseUrl: "https://api.notion.com",
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    tokenAuthStyle: "basic",
    tokenLabel: "Notion Internal Integration Token",
    oauthLabel: "Notion OAuth",
    connectedLabel: "Connected Workspace",
    defaultScopes: ["read_content", "update_content", "insert_content"],
    rawPathPrefixes: ["/v1/"],
    endpoints: [
      ["usersList", "List Notion Users", "List users.", "GET", "/v1/users", false, [], ["page_size", "start_cursor"]],
      ["search", "Search Notion", "Search pages and databases.", "POST", "/v1/search", false, [], [], "body"],
      ["pageGet", "Get Notion Page", "Get a page.", "GET", "/v1/pages/{pageId}", false, ["pageId"]],
      ["pageCreate", "Create Notion Page", "Create a page.", "POST", "/v1/pages", true, [], [], "page"],
      ["pageUpdate", "Update Notion Page", "Update page properties.", "PATCH", "/v1/pages/{pageId}", true, ["pageId"], [], "patch"],
      ["databaseQuery", "Query Notion Database", "Query a database.", "POST", "/v1/databases/{databaseId}/query", false, ["databaseId"], [], "body"],
      ["blockChildrenList", "List Notion Block Children", "List block children.", "GET", "/v1/blocks/{blockId}/children", false, ["blockId"], ["page_size", "start_cursor"]],
      ["blockChildrenAppend", "Append Notion Block Children", "Append block children.", "PATCH", "/v1/blocks/{blockId}/children", true, ["blockId"], [], "body"],
      ["commentCreate", "Create Notion Comment", "Create a comment.", "POST", "/v1/comments", true, [], [], "comment"],
    ],
  },
  {
    slug: "slack",
    displayName: "Slack",
    description: "Connects PaperClaw agents to Slack workspaces for channels, users, messages, reactions, pins, and files metadata.",
    apiBaseUrl: "https://slack.com/api",
    authUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    tokenLabel: "Slack Bot/User Token",
    oauthLabel: "Slack OAuth",
    connectedLabel: "Connected Workspace",
    defaultScopes: ["channels:read", "chat:write", "users:read", "reactions:write", "pins:write", "files:read"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["authTest", "Slack Auth Test", "Verify token identity.", "POST", "/auth.test", false],
      ["usersList", "List Slack Users", "List users.", "GET", "/users.list", false, [], ["limit", "cursor"]],
      ["conversationsList", "List Slack Conversations", "List conversations.", "GET", "/conversations.list", false, [], ["types", "limit", "cursor"]],
      ["conversationHistory", "Slack Conversation History", "Read channel history.", "GET", "/conversations.history", false, ["channel"], ["limit", "cursor", "oldest", "latest"]],
      ["messagePost", "Post Slack Message", "Post a message.", "POST", "/chat.postMessage", true, [], [], "message"],
      ["messageUpdate", "Update Slack Message", "Update a message.", "POST", "/chat.update", true, [], [], "message"],
      ["messageDelete", "Delete Slack Message", "Delete a message.", "POST", "/chat.delete", true, [], [], "message"],
      ["reactionAdd", "Add Slack Reaction", "Add a reaction.", "POST", "/reactions.add", true, [], [], "reaction"],
      ["pinAdd", "Add Slack Pin", "Pin an item.", "POST", "/pins.add", true, [], [], "pin"],
    ],
  },
  {
    slug: "asana",
    displayName: "Asana",
    description: "Connects PaperClaw agents to Asana for workspaces, projects, tasks, subtasks, sections, tags, stories, and users.",
    apiBaseUrl: "https://app.asana.com/api/1.0",
    authUrl: "https://app.asana.com/-/oauth_authorize",
    tokenUrl: "https://app.asana.com/-/oauth_token",
    tokenLabel: "Asana Personal Access Token",
    oauthLabel: "Asana OAuth",
    connectedLabel: "Connected Workspace",
    defaultScopes: ["default"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["workspacesList", "List Asana Workspaces", "List workspaces.", "GET", "/workspaces", false, [], ["limit", "offset"]],
      ["projectsList", "List Asana Projects", "List projects.", "GET", "/projects", false, [], ["workspace", "team", "limit", "offset"]],
      ["projectGet", "Get Asana Project", "Get a project.", "GET", "/projects/{projectId}", false, ["projectId"]],
      ["tasksList", "List Asana Tasks", "List tasks.", "GET", "/tasks", false, [], ["project", "workspace", "assignee", "limit", "offset"]],
      ["taskGet", "Get Asana Task", "Get a task.", "GET", "/tasks/{taskId}", false, ["taskId"]],
      ["taskCreate", "Create Asana Task", "Create a task.", "POST", "/tasks", true, [], [], "task"],
      ["taskUpdate", "Update Asana Task", "Update a task.", "PUT", "/tasks/{taskId}", true, ["taskId"], [], "task"],
      ["taskDelete", "Delete Asana Task", "Delete a task.", "DELETE", "/tasks/{taskId}", true, ["taskId"]],
      ["storyCreate", "Create Asana Story", "Comment on a task.", "POST", "/tasks/{taskId}/stories", true, ["taskId"], [], "story"],
    ],
  },
  {
    slug: "trello",
    displayName: "Trello",
    description: "Connects PaperClaw agents to Trello for boards, lists, cards, checklists, labels, comments, and members.",
    apiBaseUrl: "https://api.trello.com/1",
    authUrl: "https://trello.com/1/authorize",
    tokenUrl: "https://trello.com/1/OAuthGetAccessToken",
    tokenLabel: "Trello API Token",
    oauthLabel: "Trello OAuth",
    connectedLabel: "Connected Member",
    defaultScopes: ["read", "write"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["memberGet", "Get Trello Member", "Get a member.", "GET", "/members/{memberId}", false, ["memberId"]],
      ["memberBoards", "List Trello Member Boards", "List member boards.", "GET", "/members/{memberId}/boards", false, ["memberId"]],
      ["boardGet", "Get Trello Board", "Get a board.", "GET", "/boards/{boardId}", false, ["boardId"]],
      ["boardLists", "List Trello Lists", "List board lists.", "GET", "/boards/{boardId}/lists", false, ["boardId"]],
      ["cardsList", "List Trello Cards", "List cards on a board.", "GET", "/boards/{boardId}/cards", false, ["boardId"]],
      ["cardGet", "Get Trello Card", "Get a card.", "GET", "/cards/{cardId}", false, ["cardId"]],
      ["cardCreate", "Create Trello Card", "Create a card.", "POST", "/cards", true, [], [], "card"],
      ["cardUpdate", "Update Trello Card", "Update a card.", "PUT", "/cards/{cardId}", true, ["cardId"], [], "card"],
      ["cardComment", "Comment Trello Card", "Add a card comment.", "POST", "/cards/{cardId}/actions/comments", true, ["cardId"], [], "comment"],
    ],
  },
  {
    slug: "clickup",
    displayName: "ClickUp",
    description: "Connects PaperClaw agents to ClickUp for teams, spaces, folders, lists, tasks, comments, and custom fields.",
    apiBaseUrl: "https://api.clickup.com/api/v2",
    authUrl: "https://app.clickup.com/api",
    tokenUrl: "https://api.clickup.com/api/v2/oauth/token",
    tokenLabel: "ClickUp API Token",
    oauthLabel: "ClickUp OAuth",
    connectedLabel: "Connected Team",
    defaultScopes: ["task:read", "task:write", "team:read"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["teamsList", "List ClickUp Teams", "List teams.", "GET", "/team", false],
      ["spacesList", "List ClickUp Spaces", "List spaces.", "GET", "/team/{teamId}/space", false, ["teamId"]],
      ["foldersList", "List ClickUp Folders", "List folders.", "GET", "/space/{spaceId}/folder", false, ["spaceId"]],
      ["listsList", "List ClickUp Lists", "List lists.", "GET", "/folder/{folderId}/list", false, ["folderId"]],
      ["tasksList", "List ClickUp Tasks", "List tasks.", "GET", "/list/{listId}/task", false, ["listId"], ["page", "order_by", "reverse"]],
      ["taskGet", "Get ClickUp Task", "Get a task.", "GET", "/task/{taskId}", false, ["taskId"]],
      ["taskCreate", "Create ClickUp Task", "Create a task.", "POST", "/list/{listId}/task", true, ["listId"], [], "task"],
      ["taskUpdate", "Update ClickUp Task", "Update a task.", "PUT", "/task/{taskId}", true, ["taskId"], [], "task"],
      ["commentCreate", "Create ClickUp Comment", "Create a task comment.", "POST", "/task/{taskId}/comment", true, ["taskId"], [], "comment"],
    ],
  },
  {
    slug: "todoist",
    displayName: "Todoist",
    description: "Connects PaperClaw agents to Todoist for projects, sections, tasks, comments, and labels.",
    apiBaseUrl: "https://api.todoist.com/rest/v2",
    authUrl: "https://todoist.com/oauth/authorize",
    tokenUrl: "https://todoist.com/oauth/access_token",
    tokenLabel: "Todoist API Token",
    oauthLabel: "Todoist OAuth",
    connectedLabel: "Connected User",
    defaultScopes: ["data:read_write"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["projectsList", "List Todoist Projects", "List projects.", "GET", "/projects", false],
      ["projectCreate", "Create Todoist Project", "Create a project.", "POST", "/projects", true, [], [], "project"],
      ["sectionsList", "List Todoist Sections", "List sections.", "GET", "/sections", false, [], ["project_id"]],
      ["tasksList", "List Todoist Tasks", "List tasks.", "GET", "/tasks", false, [], ["project_id", "section_id", "label", "filter"]],
      ["taskGet", "Get Todoist Task", "Get a task.", "GET", "/tasks/{taskId}", false, ["taskId"]],
      ["taskCreate", "Create Todoist Task", "Create a task.", "POST", "/tasks", true, [], [], "task"],
      ["taskUpdate", "Update Todoist Task", "Update a task.", "POST", "/tasks/{taskId}", true, ["taskId"], [], "task"],
      ["taskClose", "Close Todoist Task", "Close a task.", "POST", "/tasks/{taskId}/close", true, ["taskId"]],
      ["commentCreate", "Create Todoist Comment", "Create a comment.", "POST", "/comments", true, [], [], "comment"],
    ],
  },
  {
    slug: "linear",
    displayName: "Linear",
    description: "Connects PaperClaw agents to Linear through GraphQL for teams, users, projects, issues, comments, cycles, and labels.",
    apiBaseUrl: "https://api.linear.app",
    authUrl: "https://linear.app/oauth/authorize",
    tokenUrl: "https://api.linear.app/oauth/token",
    tokenLabel: "Linear API Key",
    oauthLabel: "Linear OAuth",
    connectedLabel: "Connected Workspace",
    defaultScopes: ["read", "write"],
    rawPathPrefixes: ["/graphql"],
    endpoints: [
      ["graphqlQuery", "Run Linear GraphQL Query", "Run a read GraphQL query.", "POST", "/graphql", false, [], [], "body"],
      ["graphqlMutation", "Run Linear GraphQL Mutation", "Run a GraphQL mutation.", "POST", "/graphql", true, [], [], "body"],
      ["teamsList", "List Linear Teams", "List teams.", "POST", "/graphql", false, [], [], "body"],
      ["issuesList", "List Linear Issues", "List issues.", "POST", "/graphql", false, [], [], "body"],
      ["issueCreate", "Create Linear Issue", "Create an issue.", "POST", "/graphql", true, [], [], "body"],
      ["issueUpdate", "Update Linear Issue", "Update an issue.", "POST", "/graphql", true, [], [], "body"],
      ["commentCreate", "Create Linear Comment", "Create a comment.", "POST", "/graphql", true, [], [], "body"],
    ],
  },
  {
    slug: "monday",
    displayName: "monday.com",
    description: "Connects PaperClaw agents to monday.com for boards, groups, items, columns, updates, and docs through GraphQL.",
    apiBaseUrl: "https://api.monday.com/v2",
    authUrl: "https://auth.monday.com/oauth2/authorize",
    tokenUrl: "https://auth.monday.com/oauth2/token",
    tokenLabel: "monday.com API Token",
    oauthLabel: "monday.com OAuth",
    connectedLabel: "Connected Account",
    defaultScopes: ["boards:read", "boards:write", "users:read", "updates:read", "updates:write"],
    rawPathPrefixes: ["/"],
    endpoints: [
      ["graphqlQuery", "Run monday.com GraphQL Query", "Run a read GraphQL query.", "POST", "/", false, [], [], "body"],
      ["graphqlMutation", "Run monday.com GraphQL Mutation", "Run a GraphQL mutation.", "POST", "/", true, [], [], "body"],
      ["boardsList", "List monday.com Boards", "List boards.", "POST", "/", false, [], [], "body"],
      ["itemCreate", "Create monday.com Item", "Create an item.", "POST", "/", true, [], [], "body"],
      ["itemUpdate", "Update monday.com Item", "Update item column values.", "POST", "/", true, [], [], "body"],
      ["updateCreate", "Create monday.com Update", "Create an item update.", "POST", "/", true, [], [], "body"],
    ],
  },
  {
    slug: "microsoft-365",
    displayName: "Microsoft 365",
    description: "Connects PaperClaw agents to Microsoft Graph for profile, mail, calendar, OneDrive, Planner, and To Do.",
    apiBaseUrl: "https://graph.microsoft.com/v1.0",
    authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    tokenLabel: "Microsoft Graph Access Token",
    oauthLabel: "Microsoft Graph OAuth",
    connectedLabel: "Connected Tenant/User",
    defaultScopes: ["offline_access", "User.Read", "Mail.ReadWrite", "Calendars.ReadWrite", "Files.ReadWrite", "Tasks.ReadWrite", "Group.ReadWrite.All"],
    rawPathPrefixes: ["/me", "/users", "/groups", "/planner"],
    endpoints: [
      ["profileGet", "Get Microsoft Profile", "Get current profile.", "GET", "/me", false],
      ["messagesList", "List Outlook Messages", "List mail messages.", "GET", "/me/messages", false, [], ["$top", "$filter", "$select"]],
      ["messageSend", "Send Outlook Mail", "Send mail.", "POST", "/me/sendMail", true, [], [], "message"],
      ["eventsList", "List Calendar Events", "List calendar events.", "GET", "/me/events", false, [], ["$top", "$filter", "$select"]],
      ["eventCreate", "Create Calendar Event", "Create an event.", "POST", "/me/events", true, [], [], "event"],
      ["driveChildrenList", "List OneDrive Children", "List drive items.", "GET", "/me/drive/root/children", false, [], ["$top", "$select"]],
      ["todoListsList", "List Microsoft To Do Lists", "List To Do lists.", "GET", "/me/todo/lists", false],
      ["todoTaskCreate", "Create Microsoft To Do Task", "Create a To Do task.", "POST", "/me/todo/lists/{listId}/tasks", true, ["listId"], [], "task"],
      ["plannerTasksList", "List Planner Tasks", "List Planner tasks.", "GET", "/planner/plans/{planId}/tasks", false, ["planId"]],
    ],
  },
  {
    slug: "jira",
    displayName: "Jira",
    description: "Connects PaperClaw agents to Jira Cloud for sites, projects, issues, JQL search, comments, transitions, and users.",
    apiBaseUrl: "https://api.atlassian.com",
    authUrl: "https://auth.atlassian.com/authorize",
    tokenUrl: "https://auth.atlassian.com/oauth/token",
    tokenLabel: "Jira API Token",
    oauthLabel: "Atlassian OAuth",
    connectedLabel: "Cloud ID",
    defaultScopes: ["read:jira-work", "write:jira-work", "read:jira-user", "offline_access"],
    rawPathPrefixes: ["/ex/jira/"],
    endpoints: [
      ["accessibleResources", "List Atlassian Resources", "List accessible Jira resources.", "GET", "/oauth/token/accessible-resources", false],
      ["projectsList", "List Jira Projects", "List projects.", "GET", "/ex/jira/{cloudId}/rest/api/3/project/search", false, ["cloudId"], ["maxResults", "startAt", "query"]],
      ["issueGet", "Get Jira Issue", "Get an issue.", "GET", "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}", false, ["cloudId", "issueIdOrKey"], ["fields"]],
      ["issueSearch", "Search Jira Issues", "Search with JQL.", "POST", "/ex/jira/{cloudId}/rest/api/3/search", false, ["cloudId"], [], "body"],
      ["issueCreate", "Create Jira Issue", "Create an issue.", "POST", "/ex/jira/{cloudId}/rest/api/3/issue", true, ["cloudId"], [], "issue"],
      ["issueUpdate", "Update Jira Issue", "Update an issue.", "PUT", "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}", true, ["cloudId", "issueIdOrKey"], [], "issue"],
      ["commentCreate", "Create Jira Comment", "Create an issue comment.", "POST", "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}/comment", true, ["cloudId", "issueIdOrKey"], [], "comment"],
      ["transitionIssue", "Transition Jira Issue", "Transition an issue.", "POST", "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}/transitions", true, ["cloudId", "issueIdOrKey"], [], "transition"],
    ],
  },
  {
    slug: "confluence",
    displayName: "Confluence",
    description: "Connects PaperClaw agents to Confluence Cloud for spaces, pages, blog posts, comments, and search.",
    apiBaseUrl: "https://api.atlassian.com",
    authUrl: "https://auth.atlassian.com/authorize",
    tokenUrl: "https://auth.atlassian.com/oauth/token",
    tokenLabel: "Confluence API Token",
    oauthLabel: "Atlassian OAuth",
    connectedLabel: "Cloud ID",
    defaultScopes: ["read:confluence-content.all", "write:confluence-content", "read:confluence-space.summary", "offline_access"],
    rawPathPrefixes: ["/ex/confluence/"],
    endpoints: [
      ["accessibleResources", "List Atlassian Resources", "List accessible Confluence resources.", "GET", "/oauth/token/accessible-resources", false],
      ["spacesList", "List Confluence Spaces", "List spaces.", "GET", "/ex/confluence/{cloudId}/wiki/api/v2/spaces", false, ["cloudId"], ["limit", "cursor"]],
      ["pagesList", "List Confluence Pages", "List pages.", "GET", "/ex/confluence/{cloudId}/wiki/api/v2/pages", false, ["cloudId"], ["space-id", "limit", "cursor"]],
      ["pageGet", "Get Confluence Page", "Get a page.", "GET", "/ex/confluence/{cloudId}/wiki/api/v2/pages/{pageId}", false, ["cloudId", "pageId"], ["body-format"]],
      ["pageCreate", "Create Confluence Page", "Create a page.", "POST", "/ex/confluence/{cloudId}/wiki/api/v2/pages", true, ["cloudId"], [], "page"],
      ["pageUpdate", "Update Confluence Page", "Update a page.", "PUT", "/ex/confluence/{cloudId}/wiki/api/v2/pages/{pageId}", true, ["cloudId", "pageId"], [], "page"],
      ["search", "Search Confluence", "Search with CQL.", "GET", "/ex/confluence/{cloudId}/wiki/rest/api/search", false, ["cloudId"], ["cql", "limit", "start"]],
      ["commentCreate", "Create Confluence Comment", "Create a comment.", "POST", "/ex/confluence/{cloudId}/wiki/api/v2/footer-comments", true, ["cloudId"], [], "comment"],
    ],
  },
  {
    slug: "airtable",
    displayName: "Airtable",
    description: "Connects PaperClaw agents to Airtable for bases, table metadata, records, search-style listing, and batch record operations.",
    apiBaseUrl: "https://api.airtable.com/v0",
    authUrl: "https://airtable.com/oauth2/v1/authorize",
    tokenUrl: "https://airtable.com/oauth2/v1/token",
    tokenAuthStyle: "basic",
    tokenLabel: "Airtable Personal Access Token",
    oauthLabel: "Airtable OAuth",
    connectedLabel: "Connected Base/Workspace",
    defaultScopes: ["data.records:read", "data.records:write", "schema.bases:read"],
    rawPathPrefixes: ["/", "/meta/"],
    endpoints: [
      ["basesList", "List Airtable Bases", "List bases.", "GET", "/meta/bases", false, [], ["offset"]],
      ["tablesList", "List Airtable Tables", "List base tables.", "GET", "/meta/bases/{baseId}/tables", false, ["baseId"]],
      ["recordsList", "List Airtable Records", "List table records.", "GET", "/{baseId}/{tableIdOrName}", false, ["baseId", "tableIdOrName"], ["pageSize", "offset", "filterByFormula", "view"]],
      ["recordGet", "Get Airtable Record", "Get a record.", "GET", "/{baseId}/{tableIdOrName}/{recordId}", false, ["baseId", "tableIdOrName", "recordId"]],
      ["recordsCreate", "Create Airtable Records", "Create records.", "POST", "/{baseId}/{tableIdOrName}", true, ["baseId", "tableIdOrName"], [], "records"],
      ["recordsUpdate", "Update Airtable Records", "Update records.", "PATCH", "/{baseId}/{tableIdOrName}", true, ["baseId", "tableIdOrName"], [], "records"],
      ["recordsDelete", "Delete Airtable Records", "Delete records.", "DELETE", "/{baseId}/{tableIdOrName}", true, ["baseId", "tableIdOrName"], ["records[]"]],
    ],
  },
];

function quote(value) {
  return JSON.stringify(value);
}

function endpointObject(endpoint) {
  const [key, displayName, description, method, path, mutating = false, required = [], queryParams = [], bodyParam = null] = endpoint;
  return `{ key: ${quote(key)}, displayName: ${quote(displayName)}, description: ${quote(description)}, method: ${quote(method)}, path: ${quote(path)}, mutating: ${mutating}, required: ${quote(required)}, queryParams: ${quote(queryParams)}${bodyParam ? `, bodyParam: ${quote(bodyParam)}` : ""} }`;
}

function definitionSource(plugin) {
  return `import type { ProductivityDefinition } from "@kesarcloud/plugin-productivity-core";

export const definition: ProductivityDefinition = {
  id: "paperclaw.${plugin.slug}",
  packageName: "@kesarcloud/plugin-${plugin.slug}",
  version: "0.1.0",
  displayName: ${quote(plugin.displayName)},
  routePath: ${quote(plugin.slug)},
  description: ${quote(plugin.description)},
  apiBaseUrl: ${quote(plugin.apiBaseUrl)},
  authUrl: ${quote(plugin.authUrl)},
  tokenUrl: ${quote(plugin.tokenUrl)},
  tokenAuthStyle: ${quote(plugin.tokenAuthStyle ?? "body")},
  tokenLabel: ${quote(plugin.tokenLabel)},
  oauthLabel: ${quote(plugin.oauthLabel)},
  connectedLabel: ${quote(plugin.connectedLabel)},
  defaultScopes: ${quote(plugin.defaultScopes)},
  rawPathPrefixes: ${quote(plugin.rawPathPrefixes)},
  endpoints: [
    ${plugin.endpoints.map(endpointObject).join(",\n    ")},
  ],
};
`;
}

function packageJson(plugin) {
  return `{
  "name": "@kesarcloud/plugin-${plugin.slug}",
  "version": "0.1.0",
  "description": "First-party PaperClaw plugin for ${plugin.displayName} productivity tools.",
  "type": "module",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "paperclawPlugin": {
    "manifest": "./dist/manifest.js",
    "worker": "./dist/worker.js",
    "ui": "./dist/ui/"
  },
  "scripts": {
    "prebuild": "pnpm --filter @kesarcloud/plugin-sdk ensure-build-deps",
    "build": "tsc",
    "clean": "rm -rf dist",
    "test": "cd ../../.. && vitest run --project @kesarcloud/plugin-${plugin.slug}",
    "typecheck": "pnpm --filter @kesarcloud/plugin-sdk ensure-build-deps && tsc --noEmit"
  },
  "dependencies": {
    "@kesarcloud/plugin-productivity-core": "workspace:*",
    "@kesarcloud/plugin-sdk": "workspace:*"
  },
  "devDependencies": ${commonDevDeps},
  "peerDependencies": {
    "react": ">=18"
  }
}
`;
}

function tsconfig() {
  return `{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2023", "DOM"],
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
`;
}

function manifestSource() {
  return `import { createProductivityManifest } from "@kesarcloud/plugin-productivity-core";
import { definition } from "./definition.js";

export default createProductivityManifest(definition);
`;
}

function workerSource() {
  return `import { createProductivityPlugin, runProductivityWorker } from "@kesarcloud/plugin-productivity-core";
import { definition } from "./definition.js";

const plugin = createProductivityPlugin(definition);

export default plugin;
runProductivityWorker(definition, import.meta.url);
`;
}

function uiSource() {
  return `import { createProductivityUi } from "@kesarcloud/plugin-productivity-core/ui";
import { definition } from "../definition.js";

export const {
  ProductivityDashboardWidget,
  ProductivityPage,
  ProductivitySettingsPage,
} = createProductivityUi(definition, definition.id);
`;
}

function indexSource() {
  return `export { default as manifest } from "./manifest.js";
export { default as plugin } from "./worker.js";
`;
}

function testSource(plugin) {
  const mutating = plugin.endpoints.find((endpoint) => endpoint[5]) ?? plugin.endpoints[0];
  const required = Object.fromEntries((mutating[6] ?? []).map((key) => [key, `${key}-1`]));
  const bodyParam = mutating[8] ? { [mutating[8]]: { name: "Example" } } : {};
  return `import { describe, expect, it, vi } from "vitest";
import { createTestHarness } from "@kesarcloud/plugin-sdk/testing";
import manifest from "./manifest.js";
import plugin from "./worker.js";
import { definition } from "./definition.js";

const runCtx = {
  companyId: "company-1",
  projectId: "project-1",
  agentId: "agent-1",
  runId: "run-1",
};

describe("${plugin.displayName} productivity plugin", () => {
  it("declares productivity category and core tools", () => {
    expect(manifest.categories).toContain("productivity");
    expect(manifest.tools?.map((tool) => tool.name)).toContain(\`\${definition.routePath}.apiRequest\`);
  });

  it("prepares mutating requests without calling external APIs in dry-run mode", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const harness = createTestHarness({
      manifest,
      config: {
        authMode: "token",
        accessTokenSecretRef: "00000000-0000-4000-8000-000000000001",
        connectedCompanyId: runCtx.companyId,
        dryRun: true,
      },
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.executeTool("${plugin.slug}.${mutating[0]}", ${JSON.stringify({ ...required, ...bodyParam }, null, 6)}, runCtx);

    expect(result.content).toContain("Dry run");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.data).toMatchObject({ dryRun: true });
  });
});
`;
}

function skillSource(plugin) {
  return `---
name: ${plugin.slug}-tools
description: Use the PaperClaw ${plugin.displayName} productivity plugin to let agents operate official ${plugin.displayName} APIs.
---

# ${plugin.displayName} Tools

Use this skill when a marketplace micro-service agent needs to connect a
PaperClaw company to ${plugin.displayName}.

## Setup

1. Install and enable the \`@kesarcloud/plugin-${plugin.slug}\` plugin.
2. Open the plugin settings page.
3. Configure either an access token/PAT or OAuth app credentials.
4. Keep dry-run enabled while validating agent workflows.
5. Switch to live only after board approval for mutating actions.

All mutating tools honor dry-run and write PaperClaw activity/audit entries.
`;
}

for (const plugin of plugins) {
  const dir = path.join(root, "packages", "plugins", plugin.slug);
  await fs.mkdir(path.join(dir, "src", "ui"), { recursive: true });
  await fs.writeFile(path.join(dir, "package.json"), packageJson(plugin));
  await fs.writeFile(path.join(dir, "tsconfig.json"), tsconfig());
  await fs.writeFile(path.join(dir, "src", "definition.ts"), definitionSource(plugin));
  await fs.writeFile(path.join(dir, "src", "manifest.ts"), manifestSource());
  await fs.writeFile(path.join(dir, "src", "worker.ts"), workerSource());
  await fs.writeFile(path.join(dir, "src", "ui", "index.tsx"), uiSource());
  await fs.writeFile(path.join(dir, "src", "index.ts"), indexSource());
  await fs.writeFile(path.join(dir, "src", "worker.test.ts"), testSource(plugin));
  const skillDir = path.join(root, "marketplace", "skills", "tools", `${plugin.slug}-tools`);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(path.join(skillDir, "SKILL.md"), skillSource(plugin));
}
