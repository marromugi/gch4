// @ts-check
import { react } from '@ding/config/eslint/react'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...react({ tsconfigRootDir: import.meta.dirname }),
  {
    ignores: ['dist/**', 'src/routeTree.gen.ts'],
  },
]
