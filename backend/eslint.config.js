import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vitestPlugin from '@vitest/eslint-plugin'
import codegen from 'eslint-plugin-codegen'
import importPlugin from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import security from 'eslint-plugin-security'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'

import rootConfig from '../eslint.config.js'

export default [
  ...rootConfig,
  {
    plugins: {
      '@typescript-eslint': tseslint,
      vitest: vitestPlugin,
      codegen,
      import: importPlugin,
      jsdoc,
      security,
      'simple-import-sort': simpleImportSort,
      'sort-destructure-keys': sortDestructureKeys,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      'no-console': 'off', // Console is fine in backend
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
    },
  },
]
