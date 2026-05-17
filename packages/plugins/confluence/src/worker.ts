import { createProductivityPlugin, runProductivityWorker } from "@kesarcloud/plugin-productivity-core";
import { definition } from "./definition.js";

const plugin = createProductivityPlugin(definition);

export default plugin;
runProductivityWorker(definition, import.meta.url);
