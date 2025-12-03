import vitestPlugin from '@vitest/eslint-plugin'
import astroPlugin from 'eslint-plugin-astro'
import codegen from 'eslint-plugin-codegen'
import importPlugin from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import playwrightPlugin from 'eslint-plugin-playwright'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import security from 'eslint-plugin-security'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'
import tseslint from 'typescript-eslint'

import rootConfig from '../eslint.config.js'

export default [
  ...rootConfig,
  {
    // Register plugins globally for all files
    plugins: {
      vitest: vitestPlugin,
      codegen,
      import: importPlugin,
      jsdoc,
      security,
      'simple-import-sort': simpleImportSort,
      'sort-destructure-keys': sortDestructureKeys,
    },
  },
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  jsxA11yPlugin.flatConfigs.recommended,
  ...astroPlugin.configs.recommended,
  {
    files: ['**/*.astro'],
    rules: {
      'react/no-unknown-property': 'off',
      'react/jsx-key': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      codegen,
      import: importPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
      'sort-destructure-keys': sortDestructureKeys,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/triple-slash-reference': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    // Global settings for React
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['e2e/**/*.{ts,js}'],
    plugins: {
      playwright: playwrightPlugin,
    },
    rules: {
      ...playwrightPlugin.configs['flat/recommended'].rules,
    },
  },
]
