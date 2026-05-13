import { and, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import { companies, issueWorkProducts, issues, projects } from "@kesarcloud/db";
import type { OutcomeCenterFilters, OutcomeCenterKindCount, OutcomeCenterSummary } from "@kesarcloud/shared";
import { notFound } from "../errors.js";
import { toIssueWorkProduct } from "./work-products.js";

function countValue(value: unknown): number {
  return Number(value ?? 0);
}

function normalizeTextQuery(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? `%${trimmed.toLowerCase()}%` : null;
}

function buildOutcomeConditions(companyId: string, filters: OutcomeCenterFilters): SQL[] {
  const conditions: SQL[] = [
    eq(issueWorkProducts.companyId, companyId),
    eq(issues.companyId, companyId),
    isNull(issues.hiddenAt),
  ];

  if (filters.type) conditions.push(eq(issueWorkProducts.type, filters.type));
  if (filters.status) conditions.push(eq(issueWorkProducts.status, filters.status));
  if (filters.reviewState) conditions.push(eq(issueWorkProducts.reviewState, filters.reviewState));
  if (filters.projectId) {
    conditions.push(sql`coalesce(${issueWorkProducts.projectId}, ${issues.projectId}) = ${filters.projectId}`);
  }

  const q = normalizeTextQuery(filters.q);
  if (q) {
    conditions.push(sql`(
      lower(${issueWorkProducts.title}) like ${q}
      or lower(coalesce(${issueWorkProducts.summary}, '')) like ${q}
      or lower(coalesce(${issueWorkProducts.url}, '')) like ${q}
      or lower(${issues.title}) like ${q}
      or lower(coalesce(${issues.identifier}, '')) like ${q}
      or lower(coalesce(${projects.name}, '')) like ${q}
    )`);
  }

  return conditions;
}

function toKindCounts(rows: Array<{ key: string | null; count: number }>): OutcomeCenterKindCount[] {
  return rows
    .map((row) => ({ key: row.key ?? "unknown", count: countValue(row.count) }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function outcomeCenterService(db: Db) {
  async function assertCompanyExists(companyId: string) {
    const company = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, companyId))
      .then((rows) => rows[0] ?? null);
    if (!company) throw notFound("Company not found");
  }

  async function groupedCounts(
    companyId: string,
    filters: OutcomeCenterFilters,
    column:
      | typeof issueWorkProducts.type
      | typeof issueWorkProducts.status
      | typeof issueWorkProducts.reviewState
      | typeof issueWorkProducts.healthStatus,
  ) {
    const conditions = buildOutcomeConditions(companyId, filters);
    return await db
      .select({
        key: column,
        count: sql<number>`count(*)::double precision`,
      })
      .from(issueWorkProducts)
      .innerJoin(issues, eq(issueWorkProducts.issueId, issues.id))
      .leftJoin(projects, sql`${projects.id} = coalesce(${issueWorkProducts.projectId}, ${issues.projectId})`)
      .where(and(...conditions))
      .groupBy(column)
      .orderBy(desc(sql`count(*)`));
  }

  return {
    summary: async (companyId: string, filters: OutcomeCenterFilters = {}): Promise<OutcomeCenterSummary> => {
      await assertCompanyExists(companyId);
      const normalizedFilters = { ...filters, limit: filters.limit ?? 100 };
      const conditions = buildOutcomeConditions(companyId, normalizedFilters);

      const [{ total, needsReview, healthy, failedOrUnhealthy }] = await db
        .select({
          total: sql<number>`count(*)::double precision`,
          needsReview: sql<number>`sum(case when ${issueWorkProducts.reviewState} = 'needs_board_review' then 1 else 0 end)::double precision`,
          healthy: sql<number>`sum(case when ${issueWorkProducts.healthStatus} = 'healthy' then 1 else 0 end)::double precision`,
          failedOrUnhealthy: sql<number>`sum(case when ${issueWorkProducts.status} = 'failed' or ${issueWorkProducts.healthStatus} = 'unhealthy' then 1 else 0 end)::double precision`,
        })
        .from(issueWorkProducts)
        .innerJoin(issues, eq(issueWorkProducts.issueId, issues.id))
        .leftJoin(projects, sql`${projects.id} = coalesce(${issueWorkProducts.projectId}, ${issues.projectId})`)
        .where(and(...conditions));

      const [typeRows, statusRows, reviewRows, healthRows, itemRows] = await Promise.all([
        groupedCounts(companyId, normalizedFilters, issueWorkProducts.type),
        groupedCounts(companyId, normalizedFilters, issueWorkProducts.status),
        groupedCounts(companyId, normalizedFilters, issueWorkProducts.reviewState),
        groupedCounts(companyId, normalizedFilters, issueWorkProducts.healthStatus),
        db
          .select({
            workProduct: issueWorkProducts,
            issue: {
              id: issues.id,
              identifier: issues.identifier,
              title: issues.title,
              status: issues.status,
              priority: issues.priority,
            },
            project: {
              id: projects.id,
              name: projects.name,
              status: projects.status,
              color: projects.color,
            },
          })
          .from(issueWorkProducts)
          .innerJoin(issues, eq(issueWorkProducts.issueId, issues.id))
          .leftJoin(projects, sql`${projects.id} = coalesce(${issueWorkProducts.projectId}, ${issues.projectId})`)
          .where(and(...conditions))
          .orderBy(desc(issueWorkProducts.updatedAt), desc(issueWorkProducts.createdAt))
          .limit(normalizedFilters.limit),
      ]);

      return {
        companyId,
        total: countValue(total),
        needsReview: countValue(needsReview),
        healthy: countValue(healthy),
        failedOrUnhealthy: countValue(failedOrUnhealthy),
        byType: toKindCounts(typeRows),
        byStatus: toKindCounts(statusRows),
        byReviewState: toKindCounts(reviewRows),
        byHealthStatus: toKindCounts(healthRows),
        items: itemRows.map((row) => ({
          workProduct: toIssueWorkProduct(row.workProduct),
          issue: row.issue,
          project: row.project?.id
            ? {
                id: row.project.id,
                name: row.project.name,
                status: row.project.status,
                color: row.project.color,
              }
            : null,
        })),
      };
    },
  };
}
