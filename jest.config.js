/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  testRegex: 'tests/.*\\.test\\.(t|j)s$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
