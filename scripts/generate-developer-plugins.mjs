import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();

const commonDevDeps = {
  "@types/node": "^24.6.0",
  "@types/react": "^19.0.8",
  "@types/react-dom": "^19.0.3",
  react: "^19.0.8",
  "react-dom": "^19.0.8",
  typescript: "^5.7.3",
  vitest: "^3.2.4",
};

const plugins = [
  {
    slug: "figma",
    displayName: "Figma",
    description: "Connects PaperClaw agents to Figma for files, projects, comments, components, styles, variables, dev resources, and webhooks.",
    apiBaseUrl: "https://api.figma.com",
    authUrl: "https://www.figma.com/oauth",
    tokenUrl: "https://api.figma.com/v1/oauth/token",
    tokenLabel: "Figma Personal Access Token",
    oauthLabel: "Figma OAuth",
    connectedLabel: "Team or File Key",
    defaultScopes: ["file_read", "file_write"],
    rawPathPrefixes: ["/v1/", "/v2/"],
    tags: ["figma", "design", "ui", "handoff"],
    capabilities: ["files", "projects", "comments", "components", "variables", "webhooks"],
    endpoints: [
      ["fileGet", "Get Figma File", "Get a file document.", "GET", "/v1/files/{fileKey}", false, ["fileKey"], ["ids", "depth", "geometry", "plugin_data"]],
      ["fileNodesGet", "Get Figma File Nodes", "Get specific file nodes.", "GET", "/v1/files/{fileKey}/nodes", false, ["fileKey"], ["ids", "depth", "geometry"]],
      ["commentsList", "List Figma Comments", "List comments on a file.", "GET", "/v1/files/{fileKey}/comments", false, ["fileKey"]],
      ["commentCreate", "Create Figma Comment", "Create a file comment.", "POST", "/v1/files/{fileKey}/comments", true, ["fileKey"], [], "comment"],
      ["teamProjectsList", "List Figma Team Projects", "List team projects.", "GET", "/v1/teams/{teamId}/projects", false, ["teamId"]],
      ["projectFilesList", "List Figma Project Files", "List project files.", "GET", "/v1/projects/{projectId}/files", false, ["projectId"], ["branch_data"]],
      ["componentsList", "List Figma File Components", "List file components.", "GET", "/v1/files/{fileKey}/components", false, ["fileKey"]],
      ["variablesLocalGet", "Get Figma Local Variables", "Get local variables.", "GET", "/v1/files/{fileKey}/variables/local", false, ["fileKey"]],
      ["devResourcesCreate", "Create Figma Dev Resources", "Attach dev resources to nodes.", "POST", "/v1/dev_resources", true, [], [], "devResources"],
    ],
  },
  {
    slug: "miro",
    displayName: "Miro",
    description: "Connects PaperClaw agents to Miro for boards, board items, frames, comments, tags, and collaborative design planning.",
    apiBaseUrl: "https://api.miro.com",
    authUrl: "https://miro.com/oauth/authorize",
    tokenUrl: "https://api.miro.com/v1/oauth/token",
    tokenLabel: "Miro Access Token",
    oauthLabel: "Miro OAuth",
    connectedLabel: "Team or Board ID",
    defaultScopes: ["boards:read", "boards:write", "identity:read"],
    rawPathPrefixes: ["/v1/", "/v2/"],
    tags: ["miro", "whiteboard", "design", "collaboration"],
    capabilities: ["boards", "items", "comments", "frames"],
    endpoints: [
      ["boardsList", "List Miro Boards", "List boards.", "GET", "/v2/boards", false, [], ["limit", "cursor", "query"]],
      ["boardGet", "Get Miro Board", "Get a board.", "GET", "/v2/boards/{boardId}", false, ["boardId"]],
      ["itemsList", "List Miro Board Items", "List board items.", "GET", "/v2/boards/{boardId}/items", false, ["boardId"], ["limit", "cursor", "type"]],
      ["stickyNoteCreate", "Create Miro Sticky Note", "Create a sticky note.", "POST", "/v2/boards/{boardId}/sticky_notes", true, ["boardId"], [], "stickyNote"],
      ["shapeCreate", "Create Miro Shape", "Create a shape.", "POST", "/v2/boards/{boardId}/shapes", true, ["boardId"], [], "shape"],
      ["commentsList", "List Miro Comments", "List board comments.", "GET", "/v2/boards/{boardId}/comments", false, ["boardId"], ["limit", "cursor"]],
      ["commentCreate", "Create Miro Comment", "Create a board comment.", "POST", "/v2/boards/{boardId}/comments", true, ["boardId"], [], "comment"],
      ["tagsList", "List Miro Tags", "List board tags.", "GET", "/v2/boards/{boardId}/tags", false, ["boardId"]],
    ],
  },
  {
    slug: "webflow",
    displayName: "Webflow",
    description: "Connects PaperClaw agents to Webflow for sites, pages, collections, items, assets, forms, and publish workflows.",
    apiBaseUrl: "https://api.webflow.com",
    authUrl: "https://webflow.com/oauth/authorize",
    tokenUrl: "https://api.webflow.com/oauth/access_token",
    tokenLabel: "Webflow API Token",
    oauthLabel: "Webflow OAuth",
    connectedLabel: "Site ID",
    defaultScopes: ["sites:read", "sites:write", "cms:read", "cms:write", "assets:read", "assets:write"],
    rawPathPrefixes: ["/v2/"],
    tags: ["webflow", "cms", "website", "design"],
    capabilities: ["sites", "pages", "collections", "items", "assets", "forms"],
    endpoints: [
      ["sitesList", "List Webflow Sites", "List sites.", "GET", "/v2/sites", false],
      ["siteGet", "Get Webflow Site", "Get a site.", "GET", "/v2/sites/{siteId}", false, ["siteId"]],
      ["pagesList", "List Webflow Pages", "List pages.", "GET", "/v2/sites/{siteId}/pages", false, ["siteId"], ["limit", "offset"]],
      ["collectionsList", "List Webflow Collections", "List collections.", "GET", "/v2/sites/{siteId}/collections", false, ["siteId"]],
      ["itemsList", "List Webflow Collection Items", "List collection items.", "GET", "/v2/collections/{collectionId}/items", false, ["collectionId"], ["limit", "offset"]],
      ["itemCreate", "Create Webflow Collection Item", "Create a collection item.", "POST", "/v2/collections/{collectionId}/items", true, ["collectionId"], [], "item"],
      ["itemUpdate", "Update Webflow Collection Item", "Update a collection item.", "PATCH", "/v2/collections/{collectionId}/items/{itemId}", true, ["collectionId", "itemId"], [], "item"],
      ["sitePublish", "Publish Webflow Site", "Publish a site.", "POST", "/v2/sites/{siteId}/publish", true, ["siteId"], [], "publish"],
    ],
  },
  {
    slug: "github",
    displayName: "GitHub",
    description: "Connects PaperClaw agents to GitHub for repositories, issues, pull requests, branches, actions, releases, and code search.",
    apiBaseUrl: "https://api.github.com",
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    tokenLabel: "GitHub Personal Access Token",
    oauthLabel: "GitHub OAuth",
    connectedLabel: "Owner or Organization",
    defaultScopes: ["repo", "read:org", "workflow"],
    rawPathPrefixes: ["/"],
    tags: ["github", "git", "ci", "code"],
    capabilities: ["repositories", "issues", "pull-requests", "actions", "releases"],
    endpoints: [
      ["reposList", "List GitHub Repositories", "List repositories for an owner.", "GET", "/orgs/{org}/repos", false, ["org"], ["type", "per_page", "page"]],
      ["repoGet", "Get GitHub Repository", "Get a repository.", "GET", "/repos/{owner}/{repo}", false, ["owner", "repo"]],
      ["issuesList", "List GitHub Issues", "List repository issues.", "GET", "/repos/{owner}/{repo}/issues", false, ["owner", "repo"], ["state", "labels", "per_page", "page"]],
      ["issueCreate", "Create GitHub Issue", "Create an issue.", "POST", "/repos/{owner}/{repo}/issues", true, ["owner", "repo"], [], "issue"],
      ["pullsList", "List GitHub Pull Requests", "List pull requests.", "GET", "/repos/{owner}/{repo}/pulls", false, ["owner", "repo"], ["state", "per_page", "page"]],
      ["pullCommentCreate", "Comment GitHub Issue or PR", "Create an issue or PR comment.", "POST", "/repos/{owner}/{repo}/issues/{issueNumber}/comments", true, ["owner", "repo", "issueNumber"], [], "comment"],
      ["workflowRunsList", "List GitHub Workflow Runs", "List workflow runs.", "GET", "/repos/{owner}/{repo}/actions/runs", false, ["owner", "repo"], ["status", "branch", "per_page", "page"]],
      ["releaseCreate", "Create GitHub Release", "Create a release.", "POST", "/repos/{owner}/{repo}/releases", true, ["owner", "repo"], [], "release"],
    ],
  },
  {
    slug: "gitlab",
    displayName: "GitLab",
    description: "Connects PaperClaw agents to GitLab for projects, issues, merge requests, pipelines, jobs, releases, and repository files.",
    apiBaseUrl: "https://gitlab.com/api/v4",
    authUrl: "https://gitlab.com/oauth/authorize",
    tokenUrl: "https://gitlab.com/oauth/token",
    tokenLabel: "GitLab Personal Access Token",
    oauthLabel: "GitLab OAuth",
    connectedLabel: "Group or Project ID",
    defaultScopes: ["api", "read_api", "read_repository"],
    rawPathPrefixes: ["/"],
    tags: ["gitlab", "git", "ci", "code"],
    capabilities: ["projects", "issues", "merge-requests", "pipelines", "releases"],
    endpoints: [
      ["projectsList", "List GitLab Projects", "List projects.", "GET", "/projects", false, [], ["membership", "search", "per_page", "page"]],
      ["projectGet", "Get GitLab Project", "Get a project.", "GET", "/projects/{projectId}", false, ["projectId"]],
      ["issuesList", "List GitLab Issues", "List project issues.", "GET", "/projects/{projectId}/issues", false, ["projectId"], ["state", "labels", "per_page", "page"]],
      ["issueCreate", "Create GitLab Issue", "Create an issue.", "POST", "/projects/{projectId}/issues", true, ["projectId"], [], "issue"],
      ["mergeRequestsList", "List GitLab Merge Requests", "List merge requests.", "GET", "/projects/{projectId}/merge_requests", false, ["projectId"], ["state", "per_page", "page"]],
      ["mergeRequestNoteCreate", "Comment GitLab Merge Request", "Create a merge request note.", "POST", "/projects/{projectId}/merge_requests/{mergeRequestIid}/notes", true, ["projectId", "mergeRequestIid"], [], "note"],
      ["pipelinesList", "List GitLab Pipelines", "List pipelines.", "GET", "/projects/{projectId}/pipelines", false, ["projectId"], ["ref", "status", "per_page", "page"]],
      ["pipelineTrigger", "Trigger GitLab Pipeline", "Create a pipeline.", "POST", "/projects/{projectId}/pipeline", true, ["projectId"], ["ref"], "variables"],
    ],
  },
  {
    slug: "bitbucket",
    displayName: "Bitbucket",
    description: "Connects PaperClaw agents to Bitbucket Cloud for workspaces, repositories, pull requests, issues, pipelines, and deployments.",
    apiBaseUrl: "https://api.bitbucket.org/2.0",
    authUrl: "https://bitbucket.org/site/oauth2/authorize",
    tokenUrl: "https://bitbucket.org/site/oauth2/access_token",
    tokenAuthStyle: "basic",
    tokenLabel: "Bitbucket Access Token",
    oauthLabel: "Bitbucket OAuth",
    connectedLabel: "Workspace",
    defaultScopes: ["repository", "pullrequest", "issue", "pipeline"],
    rawPathPrefixes: ["/"],
    tags: ["bitbucket", "git", "pipelines", "code"],
    capabilities: ["repositories", "pull-requests", "issues", "pipelines"],
    endpoints: [
      ["repositoriesList", "List Bitbucket Repositories", "List workspace repositories.", "GET", "/repositories/{workspace}", false, ["workspace"], ["pagelen", "page", "q"]],
      ["repositoryGet", "Get Bitbucket Repository", "Get a repository.", "GET", "/repositories/{workspace}/{repoSlug}", false, ["workspace", "repoSlug"]],
      ["pullRequestsList", "List Bitbucket Pull Requests", "List pull requests.", "GET", "/repositories/{workspace}/{repoSlug}/pullrequests", false, ["workspace", "repoSlug"], ["state", "pagelen", "page"]],
      ["pullRequestCreate", "Create Bitbucket Pull Request", "Create a pull request.", "POST", "/repositories/{workspace}/{repoSlug}/pullrequests", true, ["workspace", "repoSlug"], [], "pullRequest"],
      ["issuesList", "List Bitbucket Issues", "List issues.", "GET", "/repositories/{workspace}/{repoSlug}/issues", false, ["workspace", "repoSlug"], ["state", "kind", "pagelen", "page"]],
      ["issueCreate", "Create Bitbucket Issue", "Create an issue.", "POST", "/repositories/{workspace}/{repoSlug}/issues", true, ["workspace", "repoSlug"], [], "issue"],
      ["pipelinesList", "List Bitbucket Pipelines", "List pipelines.", "GET", "/repositories/{workspace}/{repoSlug}/pipelines", false, ["workspace", "repoSlug"], ["pagelen", "page"]],
      ["pipelineTrigger", "Trigger Bitbucket Pipeline", "Trigger a pipeline.", "POST", "/repositories/{workspace}/{repoSlug}/pipelines", true, ["workspace", "repoSlug"], [], "pipeline"],
    ],
  },
  {
    slug: "azure-devops",
    displayName: "Azure DevOps",
    description: "Connects PaperClaw agents to Azure DevOps for projects, repositories, work items, pull requests, builds, releases, and pipelines.",
    apiBaseUrl: "https://dev.azure.com",
    tokenLabel: "Azure DevOps PAT",
    oauthLabel: "Azure DevOps OAuth",
    connectedLabel: "Organization",
    authScheme: "basic",
    defaultScopes: ["vso.code", "vso.work", "vso.build"],
    rawPathPrefixes: ["/"],
    tags: ["azure-devops", "git", "pipelines", "work-items"],
    capabilities: ["projects", "repositories", "work-items", "pull-requests", "builds"],
    endpoints: [
      ["projectsList", "List Azure DevOps Projects", "List projects.", "GET", "/{organization}/_apis/projects", false, ["organization"], ["api-version", "$top", "continuationToken"]],
      ["repositoriesList", "List Azure Repositories", "List Git repositories.", "GET", "/{organization}/{project}/_apis/git/repositories", false, ["organization", "project"], ["api-version"]],
      ["pullRequestsList", "List Azure Pull Requests", "List pull requests.", "GET", "/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullrequests", false, ["organization", "project", "repositoryId"], ["api-version", "searchCriteria.status"]],
      ["pullRequestCreate", "Create Azure Pull Request", "Create a pull request.", "POST", "/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullrequests", true, ["organization", "project", "repositoryId"], ["api-version"], "pullRequest"],
      ["workItemGet", "Get Azure Work Item", "Get a work item.", "GET", "/{organization}/{project}/_apis/wit/workitems/{workItemId}", false, ["organization", "project", "workItemId"], ["api-version", "$expand"]],
      ["workItemCreate", "Create Azure Work Item", "Create a work item.", "POST", "/{organization}/{project}/_apis/wit/workitems/{type}", true, ["organization", "project", "type"], ["api-version"], "patch"],
      ["buildsList", "List Azure Builds", "List builds.", "GET", "/{organization}/{project}/_apis/build/builds", false, ["organization", "project"], ["api-version", "statusFilter", "resultFilter"]],
      ["buildQueue", "Queue Azure Build", "Queue a build.", "POST", "/{organization}/{project}/_apis/build/builds", true, ["organization", "project"], ["api-version"], "build"],
    ],
  },
  {
    slug: "vercel",
    displayName: "Vercel",
    description: "Connects PaperClaw agents to Vercel for teams, projects, deployments, aliases, environment variables, domains, and checks.",
    apiBaseUrl: "https://api.vercel.com",
    authUrl: "https://vercel.com/oauth/authorize",
    tokenUrl: "https://api.vercel.com/v2/oauth/access_token",
    tokenLabel: "Vercel Access Token",
    oauthLabel: "Vercel OAuth",
    connectedLabel: "Team ID",
    defaultScopes: ["read", "write"],
    rawPathPrefixes: ["/v1/", "/v2/", "/v3/", "/v6/", "/v9/", "/v10/", "/v13/"],
    tags: ["vercel", "deploy", "frontend", "hosting"],
    capabilities: ["projects", "deployments", "env-vars", "domains", "aliases"],
    endpoints: [
      ["teamsList", "List Vercel Teams", "List teams.", "GET", "/v2/teams", false],
      ["projectsList", "List Vercel Projects", "List projects.", "GET", "/v9/projects", false, [], ["teamId", "limit", "from"]],
      ["projectGet", "Get Vercel Project", "Get a project.", "GET", "/v9/projects/{projectIdOrName}", false, ["projectIdOrName"], ["teamId"]],
      ["deploymentsList", "List Vercel Deployments", "List deployments.", "GET", "/v6/deployments", false, [], ["teamId", "projectId", "limit", "from"]],
      ["deploymentCreate", "Create Vercel Deployment", "Create a deployment.", "POST", "/v13/deployments", true, [], ["teamId"], "deployment"],
      ["envVarsList", "List Vercel Env Vars", "List project environment variables.", "GET", "/v10/projects/{projectIdOrName}/env", false, ["projectIdOrName"], ["teamId"]],
      ["envVarCreate", "Create Vercel Env Var", "Create an environment variable.", "POST", "/v10/projects/{projectIdOrName}/env", true, ["projectIdOrName"], ["teamId"], "envVar"],
      ["domainsList", "List Vercel Domains", "List domains.", "GET", "/v5/domains", false, [], ["teamId", "limit", "since"]],
    ],
  },
  {
    slug: "netlify",
    displayName: "Netlify",
    description: "Connects PaperClaw agents to Netlify for sites, deploys, forms, functions, environment variables, domains, and build hooks.",
    apiBaseUrl: "https://api.netlify.com/api/v1",
    authUrl: "https://app.netlify.com/authorize",
    tokenUrl: "https://api.netlify.com/oauth/token",
    tokenLabel: "Netlify Personal Access Token",
    oauthLabel: "Netlify OAuth",
    connectedLabel: "Account or Site ID",
    defaultScopes: ["read", "write"],
    rawPathPrefixes: ["/"],
    tags: ["netlify", "deploy", "jamstack", "hosting"],
    capabilities: ["sites", "deploys", "forms", "env-vars", "hooks"],
    endpoints: [
      ["sitesList", "List Netlify Sites", "List sites.", "GET", "/sites", false, [], ["page", "per_page", "filter"]],
      ["siteGet", "Get Netlify Site", "Get a site.", "GET", "/sites/{siteId}", false, ["siteId"]],
      ["deploysList", "List Netlify Deploys", "List site deploys.", "GET", "/sites/{siteId}/deploys", false, ["siteId"], ["page", "per_page"]],
      ["deployCreate", "Create Netlify Deploy", "Create a deploy.", "POST", "/sites/{siteId}/deploys", true, ["siteId"], [], "deploy"],
      ["formsList", "List Netlify Forms", "List site forms.", "GET", "/sites/{siteId}/forms", false, ["siteId"]],
      ["envVarsList", "List Netlify Env Vars", "List environment variables.", "GET", "/accounts/{accountId}/env", false, ["accountId"], ["site_id"]],
      ["envVarCreate", "Create Netlify Env Var", "Create an environment variable.", "POST", "/accounts/{accountId}/env", true, ["accountId"], [], "envVar"],
      ["buildHookCreate", "Create Netlify Build Hook", "Create a build hook.", "POST", "/sites/{siteId}/build_hooks", true, ["siteId"], [], "buildHook"],
    ],
  },
  {
    slug: "render",
    displayName: "Render",
    description: "Connects PaperClaw agents to Render for services, deploys, environment variables, custom domains, jobs, and service events.",
    apiBaseUrl: "https://api.render.com/v1",
    tokenLabel: "Render API Key",
    oauthLabel: "Render OAuth",
    connectedLabel: "Owner or Service ID",
    defaultScopes: ["services", "deploys"],
    rawPathPrefixes: ["/"],
    tags: ["render", "deploy", "backend", "hosting"],
    capabilities: ["services", "deploys", "env-vars", "domains", "jobs"],
    endpoints: [
      ["servicesList", "List Render Services", "List services.", "GET", "/services", false, [], ["limit", "cursor", "name"]],
      ["serviceGet", "Get Render Service", "Get a service.", "GET", "/services/{serviceId}", false, ["serviceId"]],
      ["deploysList", "List Render Deploys", "List deploys.", "GET", "/services/{serviceId}/deploys", false, ["serviceId"], ["limit", "cursor"]],
      ["deployCreate", "Create Render Deploy", "Trigger a deploy.", "POST", "/services/{serviceId}/deploys", true, ["serviceId"], [], "deploy"],
      ["envVarsList", "List Render Env Vars", "List environment variables.", "GET", "/services/{serviceId}/env-vars", false, ["serviceId"], ["limit", "cursor"]],
      ["envVarUpdate", "Update Render Env Var", "Update environment variables.", "PUT", "/services/{serviceId}/env-vars/{envVarKey}", true, ["serviceId", "envVarKey"], [], "envVar"],
      ["customDomainsList", "List Render Custom Domains", "List custom domains.", "GET", "/services/{serviceId}/custom-domains", false, ["serviceId"], ["limit", "cursor"]],
      ["customDomainCreate", "Create Render Custom Domain", "Create a custom domain.", "POST", "/services/{serviceId}/custom-domains", true, ["serviceId"], [], "domain"],
    ],
  },
  {
    slug: "supabase",
    displayName: "Supabase",
    description: "Connects PaperClaw agents to Supabase Management APIs for organizations, projects, branches, API keys, functions, and storage.",
    apiBaseUrl: "https://api.supabase.com",
    tokenLabel: "Supabase Access Token",
    oauthLabel: "Supabase OAuth",
    connectedLabel: "Organization or Project Ref",
    defaultScopes: ["projects.read", "projects.write"],
    rawPathPrefixes: ["/v1/"],
    tags: ["supabase", "backend", "database", "edge-functions"],
    capabilities: ["organizations", "projects", "branches", "functions", "storage"],
    endpoints: [
      ["organizationsList", "List Supabase Organizations", "List organizations.", "GET", "/v1/organizations", false],
      ["projectsList", "List Supabase Projects", "List projects.", "GET", "/v1/projects", false],
      ["projectGet", "Get Supabase Project", "Get a project.", "GET", "/v1/projects/{projectRef}", false, ["projectRef"]],
      ["projectCreate", "Create Supabase Project", "Create a project.", "POST", "/v1/projects", true, [], [], "project"],
      ["branchesList", "List Supabase Branches", "List project branches.", "GET", "/v1/projects/{projectRef}/branches", false, ["projectRef"]],
      ["functionsList", "List Supabase Functions", "List Edge Functions.", "GET", "/v1/projects/{projectRef}/functions", false, ["projectRef"]],
      ["functionDeploy", "Deploy Supabase Function", "Deploy an Edge Function.", "POST", "/v1/projects/{projectRef}/functions/deploy", true, ["projectRef"], [], "function"],
      ["apiKeysList", "List Supabase API Keys", "List API keys metadata.", "GET", "/v1/projects/{projectRef}/api-keys", false, ["projectRef"]],
    ],
  },
  {
    slug: "cloudflare",
    displayName: "Cloudflare",
    description: "Connects PaperClaw agents to Cloudflare for accounts, zones, DNS, Workers, Pages, KV, R2, and firewall rules.",
    apiBaseUrl: "https://api.cloudflare.com/client/v4",
    tokenLabel: "Cloudflare API Token",
    oauthLabel: "Cloudflare OAuth",
    connectedLabel: "Account or Zone ID",
    defaultScopes: ["account.read", "zone.read", "workers.write"],
    rawPathPrefixes: ["/"],
    tags: ["cloudflare", "workers", "dns", "edge"],
    capabilities: ["accounts", "zones", "dns", "workers", "pages"],
    endpoints: [
      ["accountsList", "List Cloudflare Accounts", "List accounts.", "GET", "/accounts", false, [], ["page", "per_page", "name"]],
      ["zonesList", "List Cloudflare Zones", "List zones.", "GET", "/zones", false, [], ["page", "per_page", "name", "status"]],
      ["dnsRecordsList", "List Cloudflare DNS Records", "List DNS records.", "GET", "/zones/{zoneId}/dns_records", false, ["zoneId"], ["page", "per_page", "type", "name"]],
      ["dnsRecordCreate", "Create Cloudflare DNS Record", "Create a DNS record.", "POST", "/zones/{zoneId}/dns_records", true, ["zoneId"], [], "record"],
      ["workersScriptsList", "List Cloudflare Workers", "List Workers scripts.", "GET", "/accounts/{accountId}/workers/scripts", false, ["accountId"]],
      ["workerScriptUpload", "Upload Cloudflare Worker Script", "Upload or replace a Worker script.", "PUT", "/accounts/{accountId}/workers/scripts/{scriptName}", true, ["accountId", "scriptName"], [], "script"],
      ["pagesProjectsList", "List Cloudflare Pages Projects", "List Pages projects.", "GET", "/accounts/{accountId}/pages/projects", false, ["accountId"]],
      ["kvNamespacesList", "List Cloudflare KV Namespaces", "List KV namespaces.", "GET", "/accounts/{accountId}/storage/kv/namespaces", false, ["accountId"]],
    ],
  },
  {
    slug: "digitalocean",
    displayName: "DigitalOcean",
    description: "Connects PaperClaw agents to DigitalOcean for apps, droplets, databases, domains, Kubernetes clusters, images, and projects.",
    apiBaseUrl: "https://api.digitalocean.com/v2",
    tokenLabel: "DigitalOcean API Token",
    oauthLabel: "DigitalOcean OAuth",
    connectedLabel: "Team or Project ID",
    defaultScopes: ["read", "write"],
    rawPathPrefixes: ["/"],
    tags: ["digitalocean", "cloud", "apps", "kubernetes"],
    capabilities: ["apps", "droplets", "databases", "domains", "kubernetes"],
    endpoints: [
      ["appsList", "List DigitalOcean Apps", "List App Platform apps.", "GET", "/apps", false, [], ["page", "per_page"]],
      ["appCreate", "Create DigitalOcean App", "Create an app.", "POST", "/apps", true, [], [], "app"],
      ["appDeploymentsList", "List DigitalOcean App Deployments", "List app deployments.", "GET", "/apps/{appId}/deployments", false, ["appId"], ["page", "per_page"]],
      ["appDeploymentCreate", "Create DigitalOcean App Deployment", "Create an app deployment.", "POST", "/apps/{appId}/deployments", true, ["appId"], [], "deployment"],
      ["dropletsList", "List DigitalOcean Droplets", "List droplets.", "GET", "/droplets", false, [], ["page", "per_page", "tag_name"]],
      ["databasesList", "List DigitalOcean Databases", "List database clusters.", "GET", "/databases", false, [], ["page", "per_page"]],
      ["domainsList", "List DigitalOcean Domains", "List domains.", "GET", "/domains", false, [], ["page", "per_page"]],
      ["kubernetesClustersList", "List DigitalOcean Kubernetes Clusters", "List Kubernetes clusters.", "GET", "/kubernetes/clusters", false, [], ["page", "per_page"]],
    ],
  },
  {
    slug: "hasura",
    displayName: "Hasura",
    description: "Connects PaperClaw agents to Hasura GraphQL Engine APIs for metadata, query execution, sources, actions, events, and permissions.",
    apiBaseUrl: "https://hasura.example.com",
    tokenLabel: "Hasura Admin Secret",
    oauthLabel: "Hasura OAuth",
    connectedLabel: "Hasura Project",
    apiBaseUrlLabel: "Hasura GraphQL Engine Base URL",
    authScheme: "api-key",
    accessTokenHeaderName: "x-hasura-admin-secret",
    defaultScopes: ["metadata", "graphql"],
    rawPathPrefixes: ["/v1/"],
    tags: ["hasura", "graphql", "backend", "metadata"],
    capabilities: ["metadata", "graphql", "sources", "actions", "events"],
    endpoints: [
      ["metadataExport", "Export Hasura Metadata", "Export metadata.", "POST", "/v1/metadata", false, [], [], "body"],
      ["metadataReplace", "Replace Hasura Metadata", "Replace metadata.", "POST", "/v1/metadata", true, [], [], "body"],
      ["graphqlQuery", "Run Hasura GraphQL Query", "Run GraphQL.", "POST", "/v1/graphql", false, [], [], "body"],
      ["graphqlMutation", "Run Hasura GraphQL Mutation", "Run GraphQL mutation.", "POST", "/v1/graphql", true, [], [], "body"],
      ["queryRun", "Run Hasura SQL Query", "Run a Hasura query API request.", "POST", "/v1/query", false, [], [], "body"],
      ["sourceTrackTable", "Track Hasura Table", "Track a database table.", "POST", "/v1/metadata", true, [], [], "body"],
      ["eventTriggerCreate", "Create Hasura Event Trigger", "Create event trigger metadata.", "POST", "/v1/metadata", true, [], [], "body"],
    ],
  },
  {
    slug: "appwrite",
    displayName: "Appwrite",
    description: "Connects PaperClaw agents to Appwrite for projects, databases, collections, documents, users, teams, functions, and storage.",
    apiBaseUrl: "https://cloud.appwrite.io/v1",
    tokenLabel: "Appwrite API Key",
    oauthLabel: "Appwrite OAuth",
    connectedLabel: "Project ID",
    authScheme: "api-key",
    accessTokenHeaderName: "X-Appwrite-Key",
    connectedAccountHeaderName: "X-Appwrite-Project",
    defaultScopes: ["databases.read", "databases.write", "users.read", "functions.read"],
    rawPathPrefixes: ["/"],
    tags: ["appwrite", "backend", "database", "functions"],
    capabilities: ["databases", "collections", "documents", "users", "functions"],
    endpoints: [
      ["databasesList", "List Appwrite Databases", "List databases.", "GET", "/databases", false, [], ["queries[]", "search"]],
      ["collectionsList", "List Appwrite Collections", "List collections.", "GET", "/databases/{databaseId}/collections", false, ["databaseId"], ["queries[]", "search"]],
      ["documentsList", "List Appwrite Documents", "List documents.", "GET", "/databases/{databaseId}/collections/{collectionId}/documents", false, ["databaseId", "collectionId"], ["queries[]"]],
      ["documentCreate", "Create Appwrite Document", "Create a document.", "POST", "/databases/{databaseId}/collections/{collectionId}/documents", true, ["databaseId", "collectionId"], [], "document"],
      ["documentUpdate", "Update Appwrite Document", "Update a document.", "PATCH", "/databases/{databaseId}/collections/{collectionId}/documents/{documentId}", true, ["databaseId", "collectionId", "documentId"], [], "document"],
      ["usersList", "List Appwrite Users", "List users.", "GET", "/users", false, [], ["queries[]", "search"]],
      ["functionsList", "List Appwrite Functions", "List functions.", "GET", "/functions", false, [], ["queries[]", "search"]],
      ["executionCreate", "Create Appwrite Function Execution", "Create a function execution.", "POST", "/functions/{functionId}/executions", true, ["functionId"], [], "execution"],
    ],
  },
  {
    slug: "postman",
    displayName: "Postman",
    description: "Connects PaperClaw agents to Postman for workspaces, collections, environments, APIs, monitors, mocks, and test runs.",
    apiBaseUrl: "https://api.getpostman.com",
    tokenLabel: "Postman API Key",
    oauthLabel: "Postman OAuth",
    connectedLabel: "Workspace ID",
    authScheme: "api-key",
    accessTokenHeaderName: "X-Api-Key",
    defaultScopes: ["collections", "workspaces", "environments", "monitors"],
    rawPathPrefixes: ["/"],
    tags: ["postman", "api", "testing", "collections"],
    capabilities: ["workspaces", "collections", "environments", "monitors", "mocks"],
    endpoints: [
      ["workspacesList", "List Postman Workspaces", "List workspaces.", "GET", "/workspaces", false],
      ["workspaceGet", "Get Postman Workspace", "Get a workspace.", "GET", "/workspaces/{workspaceId}", false, ["workspaceId"]],
      ["collectionsList", "List Postman Collections", "List collections.", "GET", "/collections", false, [], ["workspace"]],
      ["collectionCreate", "Create Postman Collection", "Create a collection.", "POST", "/collections", true, [], [], "collection"],
      ["environmentsList", "List Postman Environments", "List environments.", "GET", "/environments", false, [], ["workspace"]],
      ["environmentCreate", "Create Postman Environment", "Create an environment.", "POST", "/environments", true, [], [], "environment"],
      ["monitorsList", "List Postman Monitors", "List monitors.", "GET", "/monitors", false, [], ["workspace"]],
      ["mockCreate", "Create Postman Mock Server", "Create a mock server.", "POST", "/mocks", true, [], [], "mock"],
    ],
  },
  {
    slug: "sentry",
    displayName: "Sentry",
    description: "Connects PaperClaw agents to Sentry for organizations, projects, issues, events, releases, teams, alerts, and performance data.",
    apiBaseUrl: "https://sentry.io/api/0",
    authUrl: "https://sentry.io/oauth/authorize",
    tokenUrl: "https://sentry.io/oauth/token",
    tokenLabel: "Sentry Auth Token",
    oauthLabel: "Sentry OAuth",
    connectedLabel: "Organization Slug",
    defaultScopes: ["org:read", "project:read", "project:write", "event:read", "event:write"],
    rawPathPrefixes: ["/"],
    tags: ["sentry", "errors", "observability", "releases"],
    capabilities: ["organizations", "projects", "issues", "events", "releases"],
    endpoints: [
      ["organizationsList", "List Sentry Organizations", "List organizations.", "GET", "/organizations/", false],
      ["projectsList", "List Sentry Projects", "List organization projects.", "GET", "/organizations/{organizationSlug}/projects/", false, ["organizationSlug"], ["cursor"]],
      ["issuesList", "List Sentry Issues", "List organization issues.", "GET", "/organizations/{organizationSlug}/issues/", false, ["organizationSlug"], ["project", "query", "cursor"]],
      ["issueUpdate", "Update Sentry Issue", "Update an issue.", "PUT", "/issues/{issueId}/", true, ["issueId"], [], "issue"],
      ["eventsList", "List Sentry Events", "List project events.", "GET", "/projects/{organizationSlug}/{projectSlug}/events/", false, ["organizationSlug", "projectSlug"], ["cursor", "query"]],
      ["releasesList", "List Sentry Releases", "List releases.", "GET", "/organizations/{organizationSlug}/releases/", false, ["organizationSlug"], ["cursor"]],
      ["releaseCreate", "Create Sentry Release", "Create a release.", "POST", "/organizations/{organizationSlug}/releases/", true, ["organizationSlug"], [], "release"],
      ["teamsList", "List Sentry Teams", "List teams.", "GET", "/organizations/{organizationSlug}/teams/", false, ["organizationSlug"], ["cursor"]],
    ],
  },
  {
    slug: "grafana",
    displayName: "Grafana",
    description: "Connects PaperClaw agents to Grafana HTTP APIs for dashboards, folders, datasources, alerts, annotations, and service accounts.",
    apiBaseUrl: "https://grafana.example.com",
    tokenLabel: "Grafana Service Account Token",
    oauthLabel: "Grafana OAuth",
    connectedLabel: "Grafana Instance",
    apiBaseUrlLabel: "Grafana Instance Base URL",
    defaultScopes: ["dashboards:read", "dashboards:write", "datasources:read"],
    rawPathPrefixes: ["/api/"],
    tags: ["grafana", "observability", "dashboards", "alerts"],
    capabilities: ["dashboards", "folders", "datasources", "alerts", "annotations"],
    endpoints: [
      ["search", "Search Grafana", "Search dashboards and folders.", "GET", "/api/search", false, [], ["query", "type", "folderIds"]],
      ["dashboardGet", "Get Grafana Dashboard", "Get dashboard by UID.", "GET", "/api/dashboards/uid/{dashboardUid}", false, ["dashboardUid"]],
      ["dashboardCreateOrUpdate", "Create or Update Grafana Dashboard", "Create or update dashboard.", "POST", "/api/dashboards/db", true, [], [], "dashboard"],
      ["foldersList", "List Grafana Folders", "List folders.", "GET", "/api/folders", false, [], ["limit", "page"]],
      ["folderCreate", "Create Grafana Folder", "Create a folder.", "POST", "/api/folders", true, [], [], "folder"],
      ["datasourcesList", "List Grafana Datasources", "List datasources.", "GET", "/api/datasources", false],
      ["annotationsList", "List Grafana Annotations", "List annotations.", "GET", "/api/annotations", false, [], ["from", "to", "dashboardId", "panelId"]],
      ["annotationCreate", "Create Grafana Annotation", "Create an annotation.", "POST", "/api/annotations", true, [], [], "annotation"],
    ],
  },
  {
    slug: "snyk",
    displayName: "Snyk",
    description: "Connects PaperClaw agents to Snyk for organizations, projects, targets, issues, dependencies, reporting, and vulnerability workflows.",
    apiBaseUrl: "https://api.snyk.io",
    tokenLabel: "Snyk API Token",
    oauthLabel: "Snyk OAuth",
    connectedLabel: "Organization ID",
    defaultScopes: ["org.read", "project.read", "project.write"],
    rawPathPrefixes: ["/rest/", "/v1/"],
    tags: ["snyk", "security", "vulnerabilities", "dependencies"],
    capabilities: ["organizations", "projects", "targets", "issues", "reports"],
    endpoints: [
      ["orgsList", "List Snyk Organizations", "List organizations.", "GET", "/rest/orgs", false, [], ["version", "limit", "starting_after"]],
      ["projectsList", "List Snyk Projects", "List organization projects.", "GET", "/rest/orgs/{orgId}/projects", false, ["orgId"], ["version", "limit", "starting_after"]],
      ["projectGet", "Get Snyk Project", "Get a project.", "GET", "/rest/orgs/{orgId}/projects/{projectId}", false, ["orgId", "projectId"], ["version"]],
      ["targetsList", "List Snyk Targets", "List targets.", "GET", "/rest/orgs/{orgId}/targets", false, ["orgId"], ["version", "limit", "starting_after"]],
      ["issuesList", "List Snyk Issues", "List issues.", "GET", "/rest/orgs/{orgId}/issues", false, ["orgId"], ["version", "limit", "starting_after"]],
      ["projectTest", "Test Snyk Project", "Request project test.", "POST", "/v1/org/{orgId}/project/{projectId}/test", true, ["orgId", "projectId"], [], "test"],
      ["projectDeactivate", "Deactivate Snyk Project", "Deactivate a project.", "DELETE", "/v1/org/{orgId}/project/{projectId}", true, ["orgId", "projectId"]],
      ["dependenciesList", "List Snyk Dependencies", "List project dependencies.", "GET", "/v1/org/{orgId}/project/{projectId}/dep-graph", false, ["orgId", "projectId"]],
    ],
  },
  {
    slug: "sonarcloud",
    displayName: "SonarCloud",
    description: "Connects PaperClaw agents to SonarCloud Web APIs for projects, issues, quality gates, measures, components, and analysis status.",
    apiBaseUrl: "https://sonarcloud.io",
    tokenLabel: "SonarCloud Token",
    oauthLabel: "SonarCloud OAuth",
    connectedLabel: "Organization",
    authScheme: "basic",
    defaultScopes: ["projects", "issues", "measures"],
    rawPathPrefixes: ["/api/"],
    tags: ["sonarcloud", "quality", "static-analysis", "code"],
    capabilities: ["projects", "issues", "quality-gates", "measures", "components"],
    endpoints: [
      ["projectsSearch", "Search SonarCloud Projects", "Search projects.", "GET", "/api/projects/search", false, [], ["organization", "q", "p", "ps"]],
      ["issuesSearch", "Search SonarCloud Issues", "Search issues.", "GET", "/api/issues/search", false, [], ["organization", "projects", "severities", "statuses", "p", "ps"]],
      ["issueTransition", "Transition SonarCloud Issue", "Apply an issue transition.", "POST", "/api/issues/do_transition", true, [], ["issue", "transition"]],
      ["qualityGateStatus", "Get SonarCloud Quality Gate", "Get quality gate status.", "GET", "/api/qualitygates/project_status", false, [], ["projectKey", "branch", "pullRequest"]],
      ["measuresComponent", "Get SonarCloud Measures", "Get component measures.", "GET", "/api/measures/component", false, [], ["component", "metricKeys", "branch", "pullRequest"]],
      ["componentsTree", "List SonarCloud Components", "List component tree.", "GET", "/api/components/tree", false, [], ["component", "qualifiers", "p", "ps"]],
      ["projectAnalysesSearch", "Search SonarCloud Analyses", "Search analyses.", "GET", "/api/project_analyses/search", false, [], ["project", "branch", "p", "ps"]],
    ],
  },
  {
    slug: "browserstack",
    displayName: "BrowserStack",
    description: "Connects PaperClaw agents to BrowserStack for browser/device capability discovery, sessions, builds, projects, app uploads, and test observability.",
    apiBaseUrl: "https://api.browserstack.com",
    tokenLabel: "BrowserStack Basic Token",
    oauthLabel: "BrowserStack OAuth",
    connectedLabel: "Group or Project ID",
    authScheme: "basic",
    defaultScopes: ["automate", "app-automate", "test-observability"],
    rawPathPrefixes: ["/"],
    tags: ["browserstack", "testing", "browsers", "devices"],
    capabilities: ["sessions", "builds", "projects", "devices", "test-observability"],
    endpoints: [
      ["browsersList", "List BrowserStack Browsers", "List Automate browsers.", "GET", "/automate/browsers.json", false],
      ["projectsList", "List BrowserStack Projects", "List projects.", "GET", "/automate/projects.json", false],
      ["buildsList", "List BrowserStack Builds", "List builds.", "GET", "/automate/builds.json", false, [], ["limit", "offset", "status"]],
      ["sessionsList", "List BrowserStack Sessions", "List sessions for a build.", "GET", "/automate/builds/{buildId}/sessions.json", false, ["buildId"], ["limit", "offset"]],
      ["sessionGet", "Get BrowserStack Session", "Get session details.", "GET", "/automate/sessions/{sessionId}.json", false, ["sessionId"]],
      ["sessionUpdate", "Update BrowserStack Session", "Update session status metadata.", "PUT", "/automate/sessions/{sessionId}.json", true, ["sessionId"], [], "session"],
      ["appUpload", "Upload BrowserStack App", "Upload app metadata through App Automate.", "POST", "/app-automate/upload", true, [], [], "app"],
      ["devicesList", "List BrowserStack Devices", "List App Automate devices.", "GET", "/app-automate/devices.json", false],
    ],
  },
];

function replaceFinanceCore(source) {
  return source
    .replaceAll("Finance", "Developer")
    .replaceAll("finance", "developer")
    .replaceAll("FINANCE", "DEVELOPER")
    .replaceAll("developer operations data only; they do not provide accounting, tax, investment, or legal advice", "developer platform operations only; review production changes before live execution")
    .replaceAll("developer records and transactions; they do not provide accounting, tax, investment, or legal advice", "developer tools and platform resources; review production changes before live execution")
    .replaceAll("developer workspace changes", "developer platform changes");
}

function stripDeveloperFinanceGuards(source) {
  let output = source
    .replace('  allowedCurrencies: string[];\n  maxAmountSubunits: number;\n', "")
    .replace(/    allowedCurrencies: Array\.isArray\(raw\.allowedCurrencies\)[^\n]*\n/, "")
    .replace(/    maxAmountSubunits: asNumber\(raw\.maxAmountSubunits[^\n]*\n/, "")
    .replace(/        allowedCurrencies: \{[^\n]*\n/, "")
    .replace(/        maxAmountSubunits: \{[^\n]*\n/, "")
    .replace('"bearer" | "api-key" | "body"', '"bearer" | "api-key" | "basic" | "body"');
  output = output.replace(
    /function collectDeveloperGuardValues[\s\S]*?async function rememberCommand/,
    `function guardPlan(config: DeveloperConfig, plan: DeveloperRequestPlan) {
  if (plan.mutating && !config.allowedOperations.includes("*") && plan.operationKey && !config.allowedOperations.includes(plan.operationKey)) {
    throw new Error(\`\${plan.operation} is not allowed by developer plugin settings.\`);
  }
}

async function rememberCommand`,
  );
  output = output.replace(
    '  } else if (authScheme === "bearer") {\n    headers.authorization = `Bearer ${accessToken}`;\n  }',
    '  } else if (authScheme === "basic") {\n    headers.authorization = `Basic ${accessToken}`;\n  } else if (authScheme === "bearer") {\n    headers.authorization = `Bearer ${accessToken}`;\n  }',
  );
  return output;
}

async function copyDeveloperCore() {
  const sourceDir = path.join(root, "packages/plugins/finance-core");
  const targetDir = path.join(root, "packages/plugins/developer-core");
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.join(targetDir, "src"), { recursive: true });
  const packageJson = JSON.parse(await fs.readFile(path.join(sourceDir, "package.json"), "utf8"));
  packageJson.name = "@kesarcloud/plugin-developer-core";
  packageJson.description = "Shared implementation helpers for first-party PaperClaw developer platform plugins.";
  packageJson.scripts.test = "cd ../../.. && vitest run --project @kesarcloud/plugin-developer-core";
  await fs.writeFile(path.join(targetDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
  await fs.copyFile(path.join(sourceDir, "tsconfig.json"), path.join(targetDir, "tsconfig.json"));
  for (const file of ["shared.ts", "index.ts", "ui.tsx", "index.test.ts"]) {
    const source = replaceFinanceCore(await fs.readFile(path.join(sourceDir, "src", file), "utf8"));
    await fs.writeFile(path.join(targetDir, "src", file), file === "index.ts" || file === "shared.ts" ? stripDeveloperFinanceGuards(source) : source);
  }
}

function definitionSource(plugin) {
  const definition = {
    id: `paperclaw.${plugin.slug}`,
    packageName: `@kesarcloud/plugin-${plugin.slug}`,
    version: "0.1.0",
    displayName: plugin.displayName,
    routePath: plugin.slug,
    description: plugin.description,
    apiBaseUrl: plugin.apiBaseUrl,
    ...(plugin.authUrl ? { authUrl: plugin.authUrl } : {}),
    ...(plugin.tokenUrl ? { tokenUrl: plugin.tokenUrl } : {}),
    ...(plugin.tokenAuthStyle ? { tokenAuthStyle: plugin.tokenAuthStyle } : {}),
    tokenLabel: plugin.tokenLabel,
    oauthLabel: plugin.oauthLabel,
    connectedLabel: plugin.connectedLabel,
    ...(plugin.apiBaseUrlLabel ? { apiBaseUrlLabel: plugin.apiBaseUrlLabel } : {}),
    ...(plugin.authScheme ? { authScheme: plugin.authScheme } : {}),
    ...(plugin.accessTokenHeaderName ? { accessTokenHeaderName: plugin.accessTokenHeaderName } : {}),
    ...(plugin.accessTokenBodyName ? { accessTokenBodyName: plugin.accessTokenBodyName } : {}),
    ...(plugin.connectedAccountHeaderName ? { connectedAccountHeaderName: plugin.connectedAccountHeaderName } : {}),
    ...(plugin.connectedAccountBodyName ? { connectedAccountBodyName: plugin.connectedAccountBodyName } : {}),
    defaultScopes: plugin.defaultScopes,
    rawPathPrefixes: plugin.rawPathPrefixes,
    endpoints: plugin.endpoints.map(([key, displayName, description, method, endpointPath, mutating, required = [], queryParams = [], bodyParam]) => ({
      key,
      displayName,
      description,
      method,
      path: endpointPath,
      mutating,
      required,
      queryParams,
      ...(bodyParam ? { bodyParam } : {}),
    })),
  };
  return `import type { DeveloperDefinition } from "@kesarcloud/plugin-developer-core";\n\nexport const definition: DeveloperDefinition = ${JSON.stringify(definition, null, 2)};\n`;
}

async function writePlugin(plugin) {
  const targetDir = path.join(root, "packages/plugins", plugin.slug);
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.join(targetDir, "src/ui"), { recursive: true });
  const packageJson = {
    name: `@kesarcloud/plugin-${plugin.slug}`,
    version: "0.1.0",
    description: `First-party PaperClaw plugin for ${plugin.displayName} developer platform tools.`,
    type: "module",
    private: true,
    exports: { ".": "./src/index.ts" },
    paperclawPlugin: { manifest: "./dist/manifest.js", worker: "./dist/worker.js", ui: "./dist/ui/" },
    scripts: {
      prebuild: "pnpm --filter @kesarcloud/plugin-sdk ensure-build-deps",
      build: "tsc",
      clean: "rm -rf dist",
      test: `cd ../../.. && vitest run --project @kesarcloud/plugin-${plugin.slug}`,
      typecheck: "pnpm --filter @kesarcloud/plugin-sdk ensure-build-deps && tsc --noEmit",
    },
    dependencies: {
      "@kesarcloud/plugin-developer-core": "workspace:*",
      "@kesarcloud/plugin-sdk": "workspace:*",
    },
    devDependencies: commonDevDeps,
    peerDependencies: { react: ">=18" },
  };
  await fs.writeFile(path.join(targetDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
  await fs.writeFile(path.join(targetDir, "tsconfig.json"), `${JSON.stringify({
    extends: "../../../tsconfig.json",
    compilerOptions: { outDir: "dist", rootDir: "src", lib: ["ES2023", "DOM"], jsx: "react-jsx" },
    include: ["src"],
    exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
  }, null, 2)}\n`);
  await fs.writeFile(path.join(targetDir, "vitest.config.ts"), `import { defineConfig } from "vitest/config";\n\nexport default defineConfig({\n  test: {\n    name: "@kesarcloud/plugin-${plugin.slug}",\n    environment: "node",\n    include: ["src/**/*.test.ts"],\n  },\n});\n`);
  await fs.writeFile(path.join(targetDir, "src/definition.ts"), definitionSource(plugin));
  await fs.writeFile(path.join(targetDir, "src/manifest.ts"), `import { createDeveloperManifest } from "@kesarcloud/plugin-developer-core";\nimport { definition } from "./definition.js";\n\nexport default createDeveloperManifest(definition);\n`);
  await fs.writeFile(path.join(targetDir, "src/worker.ts"), `import { createDeveloperPlugin, runDeveloperWorker } from "@kesarcloud/plugin-developer-core";\nimport { definition } from "./definition.js";\n\nconst plugin = createDeveloperPlugin(definition);\n\nexport default plugin;\nrunDeveloperWorker(definition, import.meta.url);\n`);
  await fs.writeFile(path.join(targetDir, "src/index.ts"), `export { default as manifest } from "./manifest.js";\nexport { default as plugin } from "./worker.js";\n`);
  await fs.writeFile(path.join(targetDir, "src/ui/index.tsx"), `import { createDeveloperUi } from "@kesarcloud/plugin-developer-core/ui";\nimport { definition } from "../definition.js";\n\nexport const {\n  DeveloperDashboardWidget,\n  DeveloperPage,\n  DeveloperSettingsPage,\n} = createDeveloperUi(definition, definition.id);\n`);
  const mutatingEndpoint = plugin.endpoints.find((endpoint) => endpoint[5]) ?? plugin.endpoints[0];
  const params = {};
  for (const key of mutatingEndpoint[6] ?? []) params[key] = key === "type" ? "Task" : `${key}-1`;
  for (const key of mutatingEndpoint[7] ?? []) {
    if (key === "api-version") params[key] = "7.1";
  }
  if (mutatingEndpoint[8]) params[mutatingEndpoint[8]] = { name: "Example", title: "Example", body: "Example" };
  await fs.writeFile(path.join(targetDir, "src/worker.test.ts"), `import { describe, expect, it, vi } from "vitest";\nimport { createTestHarness } from "@kesarcloud/plugin-sdk/testing";\nimport manifest from "./manifest.js";\nimport plugin from "./worker.js";\nimport { definition } from "./definition.js";\n\nconst runCtx = {\n  companyId: "company-1",\n  projectId: "project-1",\n  agentId: "agent-1",\n  runId: "run-1",\n};\n\ndescribe("${plugin.displayName} developer plugin", () => {\n  it("declares developer category and core tools", () => {\n    expect(manifest.categories).toContain("developer");\n    expect(manifest.tools?.map((tool) => tool.name)).toContain(\`\${definition.routePath}.apiRequest\`);\n  });\n\n  it("prepares mutating requests without calling external APIs in dry-run mode", async () => {\n    const fetchSpy = vi.spyOn(globalThis, "fetch");\n    const harness = createTestHarness({\n      manifest,\n      config: {\n        authMode: "token",\n        accessTokenSecretRef: "00000000-0000-4000-8000-000000000001",\n        connectedCompanyId: runCtx.companyId,\n        dryRun: true,\n      },\n    });\n    await plugin.definition.setup(harness.ctx);\n\n    const result = await harness.executeTool("${plugin.slug}.${mutatingEndpoint[0]}", ${JSON.stringify(params, null, 6)}, runCtx);\n\n    expect(result.content).toContain("Dry run");\n    expect(fetchSpy).not.toHaveBeenCalled();\n    expect(result.data).toMatchObject({ dryRun: true });\n  });\n});\n`);
  const skillDir = path.join(root, "marketplace", "skills", "developer", `${plugin.slug}-tools`);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(path.join(skillDir, "SKILL.md"), `---\nname: ${plugin.slug}-tools\ndescription: Use the PaperClaw ${plugin.displayName} Developer plugin to operate official ${plugin.displayName} APIs with dry-run guardrails.\n---\n\n# ${plugin.displayName} Tools\n\nUse this skill when a PaperClaw company needs governed developer-platform automation through ${plugin.displayName}.\n\n## Setup\n\n1. Install and enable the \`@kesarcloud/plugin-${plugin.slug}\` plugin.\n2. Open the plugin settings page.\n3. Configure an access token/PAT/API key or OAuth app credentials.\n4. Keep dry-run enabled while validating agent workflows.\n5. Switch to live only after board approval for production-impacting actions.\n\nAll mutating tools honor dry-run and write PaperClaw activity/audit entries.\n`);
}

async function main() {
  await copyDeveloperCore();
  for (const plugin of plugins) await writePlugin(plugin);
}

await main();
