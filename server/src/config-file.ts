import fs from "node:fs";
import { paperclawConfigSchema, type PaperClawConfig } from "@kesarcloud/shared";
import { resolvePaperClawConfigPath } from "./paths.js";

export function readConfigFile(): PaperClawConfig | null {
  const configPath = resolvePaperClawConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return paperclawConfigSchema.parse(raw);
  } catch {
    return null;
  }
}
