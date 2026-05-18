import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-netsuite",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
