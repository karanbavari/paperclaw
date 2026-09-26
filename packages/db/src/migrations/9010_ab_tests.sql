CREATE TABLE IF NOT EXISTS "ab_studies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "workspace_id" uuid NOT NULL REFERENCES "project_workspaces"("id"),
  "agent_id" uuid REFERENCES "agents"("id") ON DELETE set null,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "evidence_summary" text,
  "source_summary" text NOT NULL,
  "source_hash" text NOT NULL,
  "draft_heartbeat_run_id" uuid REFERENCES "heartbeat_runs"("id") ON DELETE set null,
  "draft_status" text DEFAULT 'starter' NOT NULL,
  "draft_error" text,
  "audience" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "variant_a" text NOT NULL,
  "variant_b" text NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "last_checked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "ab_studies_company_updated_idx" ON "ab_studies" ("company_id", "updated_at");
CREATE INDEX IF NOT EXISTS "ab_studies_company_project_idx" ON "ab_studies" ("company_id", "project_id");

CREATE TABLE IF NOT EXISTS "ab_personas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "study_id" uuid NOT NULL REFERENCES "ab_studies"("id") ON DELETE cascade,
  "ordinal" integer NOT NULL,
  "segment" text NOT NULL,
  "profile" jsonb NOT NULL,
  "assigned_variant" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "ab_personas_ordinal_check" CHECK ("ordinal" >= 0 AND "ordinal" < 1000),
  CONSTRAINT "ab_personas_variant_check" CHECK ("assigned_variant" IN ('A','B'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "ab_personas_study_ordinal_uq" ON "ab_personas" ("study_id", "ordinal");
CREATE INDEX IF NOT EXISTS "ab_personas_company_study_idx" ON "ab_personas" ("company_id", "study_id");

CREATE TABLE IF NOT EXISTS "ab_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "study_id" uuid NOT NULL REFERENCES "ab_studies"("id") ON DELETE cascade,
  "agent_id" uuid REFERENCES "agents"("id") ON DELETE set null,
  "status" text DEFAULT 'pending_approval' NOT NULL,
  "source_hash" text NOT NULL,
  "variant_a" text NOT NULL,
  "variant_b" text NOT NULL,
  "completed_count" integer DEFAULT 0 NOT NULL,
  "error" text,
  "requested_by_user_id" text,
  "approved_by_user_id" text,
  "approved_at" timestamp with time zone,
  "started_at" timestamp with time zone,
  "finished_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "ab_runs_company_study_idx" ON "ab_runs" ("company_id", "study_id", "created_at");
CREATE INDEX IF NOT EXISTS "ab_runs_status_idx" ON "ab_runs" ("status", "updated_at");

CREATE TABLE IF NOT EXISTS "ab_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "run_id" uuid NOT NULL REFERENCES "ab_runs"("id") ON DELETE cascade,
  "batch_index" integer NOT NULL,
  "start_ordinal" integer NOT NULL,
  "end_ordinal" integer NOT NULL,
  "heartbeat_run_id" uuid REFERENCES "heartbeat_runs"("id") ON DELETE set null,
  "status" text DEFAULT 'queued' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "ab_batches_run_index_uq" ON "ab_batches" ("run_id", "batch_index");
CREATE INDEX IF NOT EXISTS "ab_batches_status_idx" ON "ab_batches" ("status", "updated_at");

CREATE TABLE IF NOT EXISTS "ab_feedback" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE cascade,
  "study_id" uuid NOT NULL REFERENCES "ab_studies"("id") ON DELETE cascade,
  "run_id" uuid NOT NULL REFERENCES "ab_runs"("id") ON DELETE cascade,
  "persona_id" uuid NOT NULL REFERENCES "ab_personas"("id") ON DELETE cascade,
  "variant" text NOT NULL,
  "rating" integer NOT NULL,
  "rationale" text NOT NULL,
  "objection" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "ab_feedback_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
  CONSTRAINT "ab_feedback_variant_check" CHECK ("variant" IN ('A','B'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "ab_feedback_run_persona_uq" ON "ab_feedback" ("run_id", "persona_id");
CREATE INDEX IF NOT EXISTS "ab_feedback_company_run_rating_idx" ON "ab_feedback" ("company_id", "run_id", "rating");
