const xoConfig = require('eslint-config-xo')
// @ts-ignore
const xoPlugins = require('xo/config/plugins.cjs')
const xoTs = require('eslint-config-xo-typescript')

/** @type {Extract<typeof xoConfig.rules['capitalized-comments'][2], { ignorePattern: string }>} */
// @ts-ignore
const capitalizedCommentsConfig = xoConfig.rules['capitalized-comments'][2]
/** @type {import('xo').Options} */
module.exports = {
  space: true,
  semicolon: false,
  prettier: true,
  rules: {
    // overrides
    // 'capitalized-comments':
    curly: ['error', 'multi-line'],
    eqeqeq: ['error', 'smart'],
    'ava/no-ignored-test-files': ['error', {files: ['src/**/__tests__/[^_]*.ts']}],
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    'unicorn/prevent-abbreviations': [
      'warn',
      ...xoPlugins.rules['unicorn/prevent-abbreviations'].slice(1),
    ],
    'capitalized-comments': [
      'warn',
      'always',
      {
        ...capitalizedCommentsConfig,
        ignorePattern: `${capitalizedCommentsConfig.ignorePattern}|empty\\s*$`,
      },
    ],
    'import/extensions': ['error', 'never'],
    // custom
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
  },
  overrides: [
    {
      files: ['src/**/__tests__/[^_]*.ts'],
      rules: {
        'padding-line-between-statements': 'off',
        'ava/no-ignored-test-files': 'off',
        'func-names': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
      },
    },
  ],
}
