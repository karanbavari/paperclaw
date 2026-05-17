import { runLogisticsWorker } from "@kesarcloud/plugin-logistics-common";
import { spec } from "./spec.js";

export default runLogisticsWorker(spec, import.meta.url);
