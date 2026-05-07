import type {
  MarketplaceInstallRequest,
  MarketplaceInstallResult,
  MarketplaceSkillCategory,
  MarketplaceSkillDetail,
  MarketplaceSkillListResponse,
} from "@kesarcloud/shared";
import { api } from "./client";

export const marketplaceApi = {
  categories: (companyId: string) =>
    api.get<MarketplaceSkillCategory[]>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/categories`,
    ),
  list: (
    companyId: string,
    query: { q?: string; category?: string; limit?: number; cursor?: string | null } = {},
  ) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.cursor) params.set("cursor", query.cursor);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return api.get<MarketplaceSkillListResponse>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/skills${suffix}`,
    );
  },
  detail: (companyId: string, skillId: string) =>
    api.get<MarketplaceSkillDetail>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/skills/${encodeURIComponent(skillId)}`,
    ),
  install: (companyId: string, payload: MarketplaceInstallRequest) =>
    api.post<MarketplaceInstallResult>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/install`,
      payload,
    ),
};
