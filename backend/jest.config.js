export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@config/(.*)$': '<rootDir>/config/$1'
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  globals: {
    'esm': true
  }
};
