export default {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/tests/**/*.ts", "**/*.test.ts"],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '\\.ts$': [
      'ts-jest',
      {
        diagnostics: true,
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  snapshotSerializers: ['jest-snapshot-serializer-raw'],
  coverageReporters: ["lcov", "text-summary"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "src/index.ts",
    "src/helpers.ts",
    "src/types.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
