ALTER TABLE "ab_runs" ADD COLUMN IF NOT EXISTS "output_version" integer DEFAULT 1 NOT NULL;
