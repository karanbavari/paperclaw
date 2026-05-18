import { createCommunicationUi } from "@kesarcloud/plugin-communication-core/ui";
import { definition } from "../definition.js";

export const {
  CommunicationDashboardWidget,
  CommunicationPage,
  CommunicationSettingsPage,
} = createCommunicationUi(definition, definition.id);
