import { createRealEstateUi } from "@kesarcloud/plugin-real-estate-core/ui";
import { definition } from "../definition.js";

export const {
  RealEstateDashboardWidget,
  RealEstatePage,
  RealEstateSettingsPage,
} = createRealEstateUi(definition, definition.id);
