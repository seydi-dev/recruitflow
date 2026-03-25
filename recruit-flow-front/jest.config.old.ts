import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/app/core/services/**/*.ts',
    '!src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage'
};

export default config;
