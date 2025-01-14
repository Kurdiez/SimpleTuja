module.exports = {
  maxWorkers: 20,

  // Keep existing config from package.json
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          allowJs: true,
        },
        useESM: true,
      },
    ],
  },

  // Add new config for test database setup
  globalSetup: '<rootDir>/commons/test/jest-setup.ts',
  globalTeardown: '<rootDir>/commons/test/jest-teardown.ts',
};
