const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  projects: [
    {
      displayName: 'heller-2-react',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      moduleDirectories: ["node_modules", "<rootDir>"],
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
      testMatch: ['**/*.test.ts?(x)']
    }
  ],
};