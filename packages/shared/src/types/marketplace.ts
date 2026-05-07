import type { Approval } from "./approval.js";
import type { CompanySkill } from "./company-skill.js";

export type MarketplaceSkillTrustLevel = "markdown_only" | "assets" | "scripts_executables" | "unknown";

export type MarketplaceSkillAssignMode = "library_only" | "ceo" | "all_agents" | "selected_agents";

export interface MarketplaceSkillCategory {
  id: string;
  name: string;
  slug: string;
  skillCount: number;
}

export interface MarketplaceSkillListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  sourceUrl: string | null;
  installSource: string | null;
  trustLevel: MarketplaceSkillTrustLevel;
  tags: string[];
  installedSkillId: string | null;
}

export interface MarketplaceSkillDetail extends MarketplaceSkillListItem {
  markdown: string | null;
  installNotes: string | null;
}

export interface MarketplaceSkillListResponse {
  items: MarketplaceSkillListItem[];
  nextCursor: string | null;
}

export interface MarketplaceInstallRequest {
  skillId: string;
  assignMode: MarketplaceSkillAssignMode;
  agentIds?: string[];
}

export interface MarketplaceInstallResult {
  skill: CompanySkill | null;
  assignedAgentIds: string[];
  approval: Approval | null;
  warnings: string[];
}
