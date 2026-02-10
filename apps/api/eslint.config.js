// @ts-check
import { typescript } from '@ding/config/eslint/typescript'
import globals from 'globals'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...typescript({ tsconfigRootDir: import.meta.dirname }),
  {
    languageOptions: {
      globals: {
        ...globals.worker,
      },
    },
  },
  {
    ignores: ['dist/**', '.wrangler/**'],
  },
]
