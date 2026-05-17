import { createLegalPlugin, runLegalWorker } from "@kesarcloud/plugin-legal-core";
import { definition } from "./definition.js";

const plugin = createLegalPlugin(definition);

export default plugin;
runLegalWorker(definition, import.meta.url);
