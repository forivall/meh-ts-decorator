// Adapt xo config for eslint, for editors where the xo plugin is borked
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const xoConfig = require('eslint-config-xo')
const xoTsConfig = require('eslint-config-xo-typescript')
const prettierConfig = require('eslint-config-prettier')
const useProject = true
const rules = {
  ...xoConfig.rules,
  ...xoTsConfig.rules,
  ...require('eslint-config-xo-typescript/space').rules,
  ...require('./.xo-config').rules,
  ...prettierConfig.rules,
  'prettier/prettier': 'warn',
}
if (!useProject) {
  rules['@typescript-eslint/await-thenable'] = 'off'
  rules['@typescript-eslint/dot-notation'] = 'off'
  rules['@typescript-eslint/no-base-to-string'] = 'off'
  rules['@typescript-eslint/no-confusing-void-expression'] = 'off'
  rules['@typescript-eslint/no-floating-promises'] = ['off']
  rules['@typescript-eslint/no-misused-promises'] = ['off']
  rules['@typescript-eslint/no-throw-literal'] = 'off'
  rules['@typescript-eslint/no-unnecessary-boolean-literal-compare'] = 'off'
  rules['@typescript-eslint/no-unnecessary-qualifier'] = 'off'
  rules['@typescript-eslint/no-unnecessary-type-arguments'] = 'off'
  rules['@typescript-eslint/no-unnecessary-type-assertion'] = 'off'
  rules['@typescript-eslint/no-unsafe-assignment'] = 'off'
  rules['@typescript-eslint/no-unsafe-call'] = 'off'
  rules['@typescript-eslint/no-unsafe-member-access'] = 'off'
  rules['@typescript-eslint/no-unsafe-return'] = 'off'
  rules['@typescript-eslint/non-nullable-type-assertion-style'] = 'off'
  rules['@typescript-eslint/prefer-includes'] = 'off'
  rules['@typescript-eslint/prefer-nullish-coalescing'] = 'off'
  rules['@typescript-eslint/prefer-readonly'] = 'off'
  rules['@typescript-eslint/prefer-string-starts-ends-with'] = 'off'
  rules['@typescript-eslint/prefer-reduce-type-parameter'] = 'off'
  rules['@typescript-eslint/promise-function-async'] = 'off'
  rules['@typescript-eslint/restrict-plus-operands'] = 'off'
  rules['@typescript-eslint/restrict-template-expressions'] = ['off']
  rules['@typescript-eslint/return-await'] = 'off'
  rules['@typescript-eslint/require-array-sort-compare'] = ['off']
  rules['@typescript-eslint/switch-exhaustiveness-check'] = 'off'
  rules['@typescript-eslint/prefer-regexp-exec'] = 'off'
}
module.exports = {
  ...xoConfig,
  ...xoTsConfig,
  parserOptions: {
    sourceType: 'module',
    jsx: false,
    ecmaVersion: 2019,
    project: useProject ? 'src/tsconfig.json' : undefined,
  },
  plugins: [...xoConfig.plugins, 'import', 'ava', 'prettier'],
  rules,
}
