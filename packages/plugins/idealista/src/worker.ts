import { createRealEstatePlugin, runRealEstateWorker } from "@kesarcloud/plugin-real-estate-core";
import { definition } from "./definition.js";

const plugin = createRealEstatePlugin(definition);

export default plugin;
runRealEstateWorker(definition, import.meta.url);
