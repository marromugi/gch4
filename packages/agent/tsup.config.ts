import { node } from '@ding/config/tsup'
import { defineConfig } from 'tsup'

export default defineConfig(
  node({
    entry: {
      index: 'src/index.ts',
    },
    dts: true,
    external: ['@ding/domain', '@google/genai'],
  })
)
