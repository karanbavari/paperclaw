ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "require_board_approval_for_ceo_skill_installs" boolean DEFAULT false NOT NULL;
