module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser', // Use TypeScript parser
      plugins: ['@typescript-eslint', 'import'],
      extends: [
        '@react-native',
        'plugin:@typescript-eslint/recommended', // Adds TypeScript-specific linting rules
      ],
      rules: {
        // Allow platform-specific extensions
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            ts: 'never',
            tsx: 'never',
            'ios.tsx': 'never',
            'android.tsx': 'never',
            'native.tsx': 'never',
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {argsIgnorePattern: '^_'},
        ], // Ignore unused vars prefixed with "_"
        '@typescript-eslint/explicit-module-boundary-types': 'off', // Disable explicit return type rule for simplicity
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: [
              '.ts',
              '.tsx',
              '.ios.tsx',
              '.android.tsx',
              '.native.tsx',
            ],
          },
        },
      },
    },
  ],
};
