module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: [
    'unused-imports',
    'react-refresh'
  ],
  ignorePatterns: ['dist', '.next'],
  rules: {
    'react-hooks/exhaustive-deps': ['error', { enableDangerousAutofixThisMayCauseInfiniteLoops: true }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'react/jsx-max-props-per-line': ['error', { maximum: 1 }],
    'react/jsx-first-prop-new-line': ['error', 'multiline'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'indent': ['error', 2],
    '@typescript-eslint/no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
      caughtErrors: 'all',
      ignoreRestSiblings: false,
      argsIgnorePattern: '^_'
    }],
    'function-paren-newline': ['error', 'never'],
    'unused-imports/no-unused-imports': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};