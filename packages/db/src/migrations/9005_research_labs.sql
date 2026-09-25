CREATE TABLE IF NOT EXISTS "research_labs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE set null,
  "execution_workspace_id" uuid REFERENCES "execution_workspaces"("id") ON DELETE set null,
  "owner_agent_id" uuid REFERENCES "agents"("id") ON DELETE set null,
  "owner_user_id" text,
  "board_approval_id" uuid REFERENCES "approvals"("id") ON DELETE set null,
  "title" text NOT NULL,
  "objective" text NOT NULL,
  "lab_type" text DEFAULT 'research' NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "allowed_agent_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "demo_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "artifacts" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "final_report" text,
  "decision_note" text,
  "metadata" jsonb,
  "submitted_to_ceo_at" timestamp with time zone,
  "submitted_to_board_at" timestamp with time zone,
  "archived_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "research_labs_company_status_idx"
  ON "research_labs" ("company_id", "status");
CREATE INDEX IF NOT EXISTS "research_labs_company_updated_idx"
  ON "research_labs" ("company_id", "updated_at");
CREATE INDEX IF NOT EXISTS "research_labs_company_project_idx"
  ON "research_labs" ("company_id", "project_id");
CREATE INDEX IF NOT EXISTS "research_labs_company_workspace_idx"
  ON "research_labs" ("company_id", "execution_workspace_id");
CREATE INDEX IF NOT EXISTS "research_labs_company_owner_agent_idx"
  ON "research_labs" ("company_id", "owner_agent_id");
