import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import codegen from 'eslint-plugin-codegen'
import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'

import rootConfig from '../eslint.config.js'

export default [
  ...rootConfig,
  {
    plugins: {
      '@typescript-eslint': tseslint,
      codegen,
      import: importPlugin,
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
]
