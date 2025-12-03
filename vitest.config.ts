import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["**/tests/**/*.ts", "**/*.test.ts"],
    snapshotSerializers: ["jest-snapshot-serializer-raw"],
    coverage: {
      enabled: !!process.env.CI && !/^18\./.test(process.version),
      reporter: ["lcov", "text"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/helpers.ts", "src/types.ts"],
      // FIXME
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
  },
});
