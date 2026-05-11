import type {
  MarketplaceCapabilityPackCategory,
  MarketplaceCapabilityPackDetail,
  MarketplaceCapabilityPackInstallRequest,
  MarketplaceCapabilityPackInstallResult,
  MarketplaceCapabilityPackListResponse,
  MarketplaceInstallRequest,
  MarketplaceInstallResult,
  MarketplacePluginCategory,
  MarketplacePluginDetail,
  MarketplacePluginInstallRequest,
  MarketplacePluginInstallResult,
  MarketplacePluginListResponse,
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
  pluginCategories: (companyId: string) =>
    api.get<MarketplacePluginCategory[]>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/plugins/categories`,
    ),
  pluginList: (
    companyId: string,
    query: { q?: string; category?: string; limit?: number; cursor?: string | null } = {},
  ) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.cursor) params.set("cursor", query.cursor);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return api.get<MarketplacePluginListResponse>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/plugins${suffix}`,
    );
  },
  pluginDetail: (companyId: string, pluginId: string) =>
    api.get<MarketplacePluginDetail>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/plugins/${encodeURIComponent(pluginId)}`,
    ),
  installPlugin: (companyId: string, payload: MarketplacePluginInstallRequest) =>
    api.post<MarketplacePluginInstallResult>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/plugins/install`,
      payload,
    ),
  packCategories: (companyId: string) =>
    api.get<MarketplaceCapabilityPackCategory[]>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/packs/categories`,
    ),
  packList: (
    companyId: string,
    query: { q?: string; category?: string; limit?: number; cursor?: string | null } = {},
  ) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.cursor) params.set("cursor", query.cursor);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return api.get<MarketplaceCapabilityPackListResponse>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/packs${suffix}`,
    );
  },
  packDetail: (companyId: string, packId: string) =>
    api.get<MarketplaceCapabilityPackDetail>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/packs/${encodeURIComponent(packId)}`,
    ),
  installPack: (companyId: string, payload: MarketplaceCapabilityPackInstallRequest) =>
    api.post<MarketplaceCapabilityPackInstallResult>(
      `/companies/${encodeURIComponent(companyId)}/marketplace/packs/install`,
      payload,
    ),
};
