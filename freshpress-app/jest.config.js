/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  // Run tests in a React Native-like environment
  testEnvironment: 'node',
  // Transform TypeScript files using babel-jest (via jest-expo preset which uses babel-preset-expo)
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        configFile: './babel.config.js',
      },
    ],
  },
  // Support @/ path alias
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Ignore node_modules except packages that need transpilation
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|@expo-google-fonts/.*' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|@unimodules/.*' +
      '|unimodules' +
      '|sentry-expo' +
      '|native-base' +
      '|react-native-svg' +
      '|socket.io-client' +
      '|engine.io-client' +
      '|@socket.io' +
      ')/)',
  ],
  // File extensions Jest will look for
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Setup files after test framework is installed (jest-circus/jasmine2)
  // Add '@testing-library/jest-native/extend-expect' here when using older jest-native
  setupFilesAfterEnv: [],
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  // Coverage collection
  collectCoverageFrom: [
    'store/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
};

module.exports = config;
