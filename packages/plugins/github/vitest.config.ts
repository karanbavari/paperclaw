import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-github",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
