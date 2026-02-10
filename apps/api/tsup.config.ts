import { node } from '@ding/config/tsup'
import { defineConfig } from 'tsup'

export default defineConfig(
  node({
    entry: ['src/worker.ts'],
    outDir: 'dist',
    // Cloudflare Workers 専用モジュールを external に設定
    external: ['cloudflare:workers'],
  })
)
