import { runEcommerceWorker } from "@kesarcloud/plugin-ecommerce-common";
import { spec } from "./spec.js";

export default runEcommerceWorker(spec, import.meta.url);
