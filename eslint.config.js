// Flat config for ESLint v9+ (minimal, no extends/plugins)
export default [
  {
    ignores: [
      'index.html',
      '*.html',
      'dist/',
      'build/',
      'node_modules/',
      'coverage/',
      'coverage/**',
      'coverage/lcov-report/**',
      '.nyc_output/',
      'TaxFlowAI/',
      'frontend/',
      'backend/',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        _: 'readonly',
        getFormData: 'readonly',
        TaxCalculator: 'readonly',
        lastCalculationData: 'writable',
        test: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
    },
  },
];
