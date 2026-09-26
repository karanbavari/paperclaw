ALTER TABLE "ab_studies" ADD COLUMN IF NOT EXISTS "audit_report" jsonb;
ALTER TABLE "ab_studies" ADD COLUMN IF NOT EXISTS "market_context" jsonb;
ALTER TABLE "ab_runs" ADD COLUMN IF NOT EXISTS "target_count" integer DEFAULT 1000 NOT NULL;
ALTER TABLE "ab_runs" ADD COLUMN IF NOT EXISTS "output_version" integer DEFAULT 1 NOT NULL;
ALTER TABLE "ab_feedback" ADD COLUMN IF NOT EXISTS "budget_fit" text DEFAULT 'unknown' NOT NULL;
ALTER TABLE "ab_feedback" ADD COLUMN IF NOT EXISTS "workflow_fit" text DEFAULT 'unknown' NOT NULL;
