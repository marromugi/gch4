import { reactLibrary } from '@ding/config/tsup'
import { defineConfig } from 'tsup'

export default defineConfig(
  reactLibrary({
    entry: {
      index: 'src/components/core/index.ts',
      'layout/index': 'src/components/layout/index.ts',
      'icon/index': 'src/components/icon/index.ts',
      'lib/index': 'src/lib/index.ts',
      'hooks/index': 'src/hooks/index.ts',
    },
    external: ['motion'],
  })
)
