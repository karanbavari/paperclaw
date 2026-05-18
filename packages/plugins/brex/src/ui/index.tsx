import { createFinanceUi } from "@kesarcloud/plugin-finance-core/ui";
import { definition } from "../definition.js";

export const {
  FinanceDashboardWidget,
  FinancePage,
  FinanceSettingsPage,
} = createFinanceUi(definition, definition.id);
