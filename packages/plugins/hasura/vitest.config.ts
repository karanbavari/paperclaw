import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-hasura",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
