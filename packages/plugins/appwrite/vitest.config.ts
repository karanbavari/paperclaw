import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-appwrite",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
