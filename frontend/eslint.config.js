// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: [
      'dist/**',
      '.angular/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    files: ['src/**/*.ts', 'projects/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: 'giddy', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'giddy', style: 'camelCase' },
      ],
      '@angular-eslint/no-host-metadata-property': 'off',
    },
  },
  {
    files: ['src/**/*.html', 'projects/**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
  },
  prettier,
);
