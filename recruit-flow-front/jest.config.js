module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jsdom',

  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ],

  moduleFileExtensions: ['ts', 'html', 'js', 'json'],

  roots: ['<rootDir>/src'],

  testMatch: ['**/*.spec.ts'],

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};
