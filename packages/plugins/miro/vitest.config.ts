import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-miro",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
