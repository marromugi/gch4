import { node } from '@ding/config/tsup'
import { defineConfig } from 'tsup'

export default defineConfig(
  node({
    entry: {
      index: 'src/index.ts',
      'provider/index': 'src/provider/index.ts',
      'provider/gemini/index': 'src/provider/gemini/index.ts',
      'agent/index': 'src/agent/index.ts',
    },
    dts: true,
    external: ['@ding/domain', '@google/genai'],
  })
)
