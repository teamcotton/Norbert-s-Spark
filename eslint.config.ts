import type { Linter } from 'eslint'

import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import codegen from 'eslint-plugin-codegen'
import functionalPlugin from 'eslint-plugin-functional'
import importPlugin from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import promisePlugin from 'eslint-plugin-promise'
import security from 'eslint-plugin-security'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'

const config: Linter.Config[] = [
  js.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tseslint as any,
      codegen: codegen as any,
      functional: functionalPlugin,
      import: importPlugin,
      jsdoc,
      promise: promisePlugin,
      security,
      'simple-import-sort': simpleImportSort,
      'sort-destructure-keys': sortDestructureKeys,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      semi: ['error', 'never'],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'sort-destructure-keys/sort-destructure-keys': 'warn',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      ...promisePlugin.configs.recommended.rules,
      // Functional plugin disabled - too restrictive even with lite config
      // ...functionalPlugin.configs.lite.rules,
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-param-names': 'warn',
      'jsdoc/check-tag-names': 'warn',
      'jsdoc/check-types': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',
    },
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/test/**',
      '**/tests/**',
      '**/e2e/**',
    ],
    rules: {
      'functional/no-return-void': 'off',
      'functional/no-expression-statements': 'off',
      'functional/functional-parameters': 'off',
      'functional/no-class-inheritance': 'off',
      'functional/no-classes': 'off',
      'functional/no-this-expressions': 'off',
      'functional/no-let': 'off',
      'functional/no-loop-statements': 'off',
      'functional/immutable-data': 'off',
      'functional/prefer-immutable-types': 'off',
      'functional/type-declaration-immutability': 'off',
      'functional/prefer-tacit': 'off',
      'functional/no-mixed-types': 'off',
      'functional/no-conditional-statements': 'off',
      'functional/no-try-statements': 'off',
      'functional/no-throw-statements': 'off',
    },
  },
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/.next/',
      '**/coverage/',
      '**/build/',
      '**/frontend/next-env.d.ts',
      '**/playwright-report/',
      '**/test-results/',
    ],
  },
]

export default config
