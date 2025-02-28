export default {
  testEnvironment: "node",
  transform: {},
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
  },
  moduleDirectories: ["node_modules", "src/tests/__mocks__"],
  setupFilesAfterEnv: [
    "<rootDir>/src/tests/setup.js",
    "<rootDir>/src/tests/setupMocks.js",
  ],
  testTimeout: 30000,
  extensionsToTreatAsEsm: [],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  verbose: true,
};
