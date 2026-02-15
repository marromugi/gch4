import { node } from '@ding/config/tsup'
import { defineConfig } from 'tsup'

export default defineConfig(
  node({
    entry: ['src/functions.ts'],
    outDir: 'dist',
    format: ['cjs'],
    // Cloud Functions は CommonJS を使用
    // firebase-functions, firebase-admin はバンドルしない
    // @libsql/client, drizzle-orm はネイティブ依存があるためバンドルしない
    external: ['firebase-functions', 'firebase-admin', '@libsql/client', 'drizzle-orm'],
    // ワークスペースパッケージはバンドルする
    noExternal: [/^@ding\//],
  })
)
