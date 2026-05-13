import type {
  IssueWorkProduct,
  IssueWorkProductReviewState,
  IssueWorkProductStatus,
  IssueWorkProductType,
} from "./work-product.js";

export interface OutcomeCenterIssueRef {
  id: string;
  identifier: string | null;
  title: string;
  status: string;
  priority: string;
}

export interface OutcomeCenterProjectRef {
  id: string;
  name: string;
  status: string;
  color: string | null;
}

export interface OutcomeCenterItem {
  workProduct: IssueWorkProduct;
  issue: OutcomeCenterIssueRef;
  project: OutcomeCenterProjectRef | null;
}

export interface OutcomeCenterKindCount {
  key: string;
  count: number;
}

export interface OutcomeCenterSummary {
  companyId: string;
  total: number;
  needsReview: number;
  healthy: number;
  failedOrUnhealthy: number;
  byType: OutcomeCenterKindCount[];
  byStatus: OutcomeCenterKindCount[];
  byReviewState: OutcomeCenterKindCount[];
  byHealthStatus: OutcomeCenterKindCount[];
  items: OutcomeCenterItem[];
}

export interface OutcomeCenterFilters {
  type?: IssueWorkProductType;
  status?: IssueWorkProductStatus;
  reviewState?: IssueWorkProductReviewState;
  projectId?: string;
  q?: string;
  limit?: number;
}
