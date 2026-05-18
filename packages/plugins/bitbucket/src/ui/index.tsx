import { createDeveloperUi } from "@kesarcloud/plugin-developer-core/ui";
import { definition } from "../definition.js";

export const {
  DeveloperDashboardWidget,
  DeveloperPage,
  DeveloperSettingsPage,
} = createDeveloperUi(definition, definition.id);
