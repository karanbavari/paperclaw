import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-brex",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
