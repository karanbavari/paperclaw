-- Existing local databases may have applied 9010 before the draft-preview
-- columns were added to its source file. Keep this repair additive and
-- idempotent so those databases converge without losing A/B studies.
ALTER TABLE "ab_studies"
  ADD COLUMN IF NOT EXISTS "draft_heartbeat_run_id" uuid REFERENCES "heartbeat_runs"("id") ON DELETE set null;

ALTER TABLE "ab_studies"
  ADD COLUMN IF NOT EXISTS "draft_status" text DEFAULT 'starter' NOT NULL;

ALTER TABLE "ab_studies"
  ADD COLUMN IF NOT EXISTS "draft_error" text;
