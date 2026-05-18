import { createCommunicationPlugin, runCommunicationWorker } from "@kesarcloud/plugin-communication-core";
import { definition } from "./definition.js";

const plugin = createCommunicationPlugin(definition);

export default plugin;
runCommunicationWorker(definition, import.meta.url);
