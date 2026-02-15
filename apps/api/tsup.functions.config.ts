import { node } from '@ding/config/tsup'
import { defineConfig } from 'tsup'

export default defineConfig(
  node({
    entry: ['src/functions.ts'],
    outDir: 'dist',
    format: ['cjs'],
    // Cloud Functions は CommonJS を使用
    // firebase-functions はバンドルしない
    external: ['firebase-functions', 'firebase-admin'],
  })
)
