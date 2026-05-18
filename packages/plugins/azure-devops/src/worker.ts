import { createDeveloperPlugin, runDeveloperWorker } from "@kesarcloud/plugin-developer-core";
import { definition } from "./definition.js";

const plugin = createDeveloperPlugin(definition);

export default plugin;
runDeveloperWorker(definition, import.meta.url);
