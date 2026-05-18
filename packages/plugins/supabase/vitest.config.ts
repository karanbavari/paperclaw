import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@kesarcloud/plugin-supabase",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
