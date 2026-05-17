import { createProductivityUi } from "@kesarcloud/plugin-productivity-core/ui";
import { definition } from "../definition.js";

export const {
  ProductivityDashboardWidget,
  ProductivityPage,
  ProductivitySettingsPage,
} = createProductivityUi(definition, definition.id);
