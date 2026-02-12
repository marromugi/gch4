// @ts-check
import { typescript } from '@ding/config/eslint/typescript'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...typescript({ tsconfigRootDir: import.meta.dirname }),
  {
    ignores: ['dist/**'],
  },
]
