import { node } from '@ding/config/tsup'
import { defineConfig } from 'tsup'

export default defineConfig(
  node({
    entry: {
      index: 'src/index.ts',
      'schema/index': 'src/schema/index.ts',
      client: 'src/client.ts',
    },
    dts: true,
  })
)
