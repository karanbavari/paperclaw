import type { Db } from "@kesarcloud/db";
import {
  COMPANY_PROFILE_CURRENCY_OPTIONS,
  COMPANY_PROFILE_LANGUAGE_OPTIONS,
  type CompanyProfile,
} from "@kesarcloud/shared";
import {
  applyPaperClawLocalizationInstructionBlock,
  renderPaperClawLocalizationInstructionBlock,
  type PaperClawLocalizationInput,
} from "@kesarcloud/adapter-utils/server-utils";
import { logger } from "../middleware/logger.js";
import { agentService } from "./agents.js";
import { agentInstructionsService } from "./agent-instructions.js";

function languageLabel(code: string | null | undefined) {
  if (!code) return null;
  return COMPANY_PROFILE_LANGUAGE_OPTIONS.find((option) => option.code === code)?.label ?? code;
}

function currencyLabel(code: string | null | undefined) {
  if (!code) return null;
  return COMPANY_PROFILE_CURRENCY_OPTIONS.find((option) => option.code === code)?.label ?? code;
}

export function buildPaperClawLocalization(profile: CompanyProfile | null): PaperClawLocalizationInput | null {
  if (!profile) return null;
  if (!profile.defaultLanguage && !profile.defaultCurrency && !profile.timezone) return null;
  return {
    defaultLanguage: profile.defaultLanguage,
    defaultLanguageLabel: languageLabel(profile.defaultLanguage),
    defaultCurrency: profile.defaultCurrency,
    defaultCurrencyLabel: currencyLabel(profile.defaultCurrency),
    timezone: profile.timezone,
  };
}

export function companyLocalizationService(db: Db) {
  const agents = agentService(db);
  const instructions = agentInstructionsService();

  return {
    syncManagedAgentInstructions: async (companyId: string, profile: CompanyProfile) => {
      const localization = buildPaperClawLocalization(profile);
      if (!localization) return { updated: 0, skipped: 0, failed: 0 };

      const block = renderPaperClawLocalizationInstructionBlock(localization);
      const companyAgents = await agents.list(companyId, { includeTerminated: true });
      let updated = 0;
      let skipped = 0;
      let failed = 0;

      for (const agent of companyAgents) {
        try {
          const bundle = await instructions.getBundle(agent);
          if (bundle.mode !== "managed") {
            skipped += 1;
            continue;
          }
          const entryFile = bundle.entryFile || "AGENTS.md";
          let currentContent = "";
          try {
            currentContent = (await instructions.readFile(agent, entryFile)).content;
          } catch {
            currentContent = "";
          }
          const nextContent = applyPaperClawLocalizationInstructionBlock(currentContent, block);
          if (nextContent === currentContent) {
            skipped += 1;
            continue;
          }
          const result = await instructions.writeFile(agent, entryFile, nextContent);
          await agents.update(agent.id, { adapterConfig: result.adapterConfig });
          updated += 1;
        } catch (error) {
          failed += 1;
          logger.warn(
            {
              err: error,
              companyId,
              agentId: agent.id,
            },
            "Failed to sync company localization into managed agent instructions",
          );
        }
      }

      return { updated, skipped, failed };
    },
  };
}
