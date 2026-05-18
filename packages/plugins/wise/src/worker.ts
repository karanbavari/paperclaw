import { createFinancePlugin, runFinanceWorker } from "@kesarcloud/plugin-finance-core";
import { definition } from "./definition.js";

const plugin = createFinancePlugin(definition);

export default plugin;
runFinanceWorker(definition, import.meta.url);
