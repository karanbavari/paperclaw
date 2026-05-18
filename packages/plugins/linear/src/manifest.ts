import { createProductivityManifest } from "@kesarcloud/plugin-productivity-core";
import { definition } from "./definition.js";

const manifest = createProductivityManifest(definition);
manifest.categories = [...manifest.categories, "developer"];

export default manifest;
