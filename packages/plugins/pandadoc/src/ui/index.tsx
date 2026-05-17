import { createLegalUi } from "@kesarcloud/plugin-legal-core/ui";
import { definition } from "../definition.js";

export const {
  LegalDashboardWidget,
  LegalPage,
  LegalSettingsPage,
} = createLegalUi(definition, definition.id);
