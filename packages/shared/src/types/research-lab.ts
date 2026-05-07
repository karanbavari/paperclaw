import type { ResearchLabStatus, ResearchLabType } from "../constants.js";
import type { Agent } from "./agent.js";
import type { Approval } from "./approval.js";
import type { ExecutionWorkspace, WorkspaceRuntimeService } from "./workspace-runtime.js";

export interface ResearchLabArtifact {
  title: string;
  url?: string | null;
  kind?: string | null;
  description?: string | null;
}

export interface ResearchLab {
  id: string;
  companyId: string;
  projectId: string | null;
  executionWorkspaceId: string | null;
  ownerAgentId: string | null;
  ownerUserId: string | null;
  boardApprovalId: string | null;
  title: string;
  objective: string;
  labType: ResearchLabType;
  status: ResearchLabStatus;
  allowedAgentIds: string[];
  demoUrls: string[];
  artifacts: ResearchLabArtifact[];
  finalReport: string | null;
  decisionNote: string | null;
  metadata: Record<string, unknown> | null;
  submittedToCeoAt: Date | null;
  submittedToBoardAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchLabListItem extends ResearchLab {
  allowedAgents: Pick<Agent, "id" | "name" | "role" | "status">[];
  executionWorkspace: Pick<ExecutionWorkspace, "id" | "name" | "status" | "cwd"> | null;
  boardApproval: Pick<Approval, "id" | "status" | "decisionNote" | "decidedAt"> | null;
}

export interface ResearchLabDetail extends ResearchLabListItem {
  runtimeServices: WorkspaceRuntimeService[];
}
