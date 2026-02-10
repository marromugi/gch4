// @ts-check
import { base } from '@ding/config/eslint/base'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.wrangler/**',
      '**/routeTree.gen.ts',
      '**/src-tauri/**',
    ],
  },
]
