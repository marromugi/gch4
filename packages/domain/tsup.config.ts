import { node } from '@ding/config/tsup'
import { defineConfig } from 'tsup'

export default defineConfig(
  node({
    entry: {
      // Main entry
      index: 'src/index.ts',

      // Domain layer entries
      'domain/index': 'src/domain/index.ts',
      'domain/shared/index': 'src/domain/shared/index.ts',
      'domain/valueObject/index': 'src/domain/valueObject/index.ts',
      'domain/entity/index': 'src/domain/entity/index.ts',
      'domain/repository/index': 'src/domain/repository/index.ts',
      'domain/service/index': 'src/domain/service/index.ts',

      // Infrastructure layer entries
      'infrastructure/index': 'src/infrastructure/index.ts',
      'infrastructure/repository/index': 'src/infrastructure/repository/index.ts',
      'infrastructure/service/index': 'src/infrastructure/service/index.ts',

      // Presentation layer entries
      'presentation/index': 'src/presentation/index.ts',
      'presentation/usecase/index': 'src/presentation/usecase/index.ts',
    },
    dts: true,
    external: ['@ding/database', '@ding/database/schema', '@ding/database/client', 'drizzle-orm'],
  })
)
