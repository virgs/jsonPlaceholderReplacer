module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Completely disable ALL caching mechanisms to prevent the write-file-atomic issue
  cache: false,

  // Disable watchman to prevent file system caching issues
  watchman: false,

  // Coverage configuration
  collectCoverageFrom: ["src/**.ts"],
  coveragePathIgnorePatterns: ["src/index.ts"],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },

  // Test matching
  testRegex: ".*\\.test\\.ts$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Modern ts-jest configuration
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: false,
        isolatedModules: false,
      },
    ],
  },

  // Clean state between tests
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,

  // Prevent hanging processes
  forceExit: true,
  detectOpenHandles: true,

  // Single worker to avoid concurrency issues in CI
  maxWorkers: 1,

  // Prevent module caching
  resetModules: true,
};
