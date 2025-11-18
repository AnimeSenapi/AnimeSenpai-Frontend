module.exports = {
  root: true,
  extends: ['next', 'next/core-web-vitals'],
  plugins: ['eslint-comments'],
  rules: {
    // Prevent risky patterns
    'no-console': ['error', { allow: ['error'] }],
    'eslint-comments/no-unused-disable': 'error',
    'eslint-comments/no-unlimited-disable': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

    // TypeScript strictness is handled by Next/tsc; plugin-specific rules are disabled here to avoid version conflicts

    // Avoid dangerouslySetInnerHTML except explicitly allowed files/components
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
        message:
          'Avoid dangerouslySetInnerHTML. Use a sanitized, whitelisted component if absolutely necessary.',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.*', '**/__tests__/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
}


