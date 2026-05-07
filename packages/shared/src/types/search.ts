import type { IssuePriority, IssueStatus } from "../constants.js";

export const COMPANY_SEARCH_SCOPES = ["all", "issues", "comments", "documents", "agents", "projects", "meetings", "memory"] as const;
export type CompanySearchScope = (typeof COMPANY_SEARCH_SCOPES)[number];

export type CompanySearchResultType = "issue" | "agent" | "project" | "meeting" | "memory";

export interface CompanySearchHighlight {
  start: number;
  end: number;
}

export interface CompanySearchSnippet {
  field: string;
  label: string;
  text: string;
  highlights: CompanySearchHighlight[];
}

export interface CompanySearchIssueSummary {
  id: string;
  identifier: string | null;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeAgentId: string | null;
  assigneeUserId: string | null;
  projectId: string | null;
  updatedAt: string;
}

export interface CompanySearchMeetingSummary {
  id: string;
  title: string;
  status: string;
  messageId: string | null;
  messageAuthorType: "board" | "agent" | "system" | null;
  messageAuthorAgentId: string | null;
  messageCreatedAt: string | null;
  updatedAt: string;
}

export interface CompanySearchMemorySummary {
  id: string;
  memoryType: string;
  kind: string;
  status: string;
  scopeType: string;
  scopeId: string | null;
  tags: string[];
  updatedAt: string;
}

export interface CompanySearchResult {
  id: string;
  type: CompanySearchResultType;
  score: number;
  title: string;
  href: string;
  matchedFields: string[];
  sourceLabel: string | null;
  snippet: string | null;
  snippets: CompanySearchSnippet[];
  issue?: CompanySearchIssueSummary;
  meeting?: CompanySearchMeetingSummary;
  memory?: CompanySearchMemorySummary;
  updatedAt: string | null;
  previewImageUrl: string | null;
}

export interface CompanySearchResponse {
  query: string;
  normalizedQuery: string;
  scope: CompanySearchScope;
  limit: number;
  offset: number;
  results: CompanySearchResult[];
  countsByType: Record<CompanySearchResultType, number>;
  hasMore: boolean;
}
