import { defineConfig } from 'vitest/config'
import path from 'path'

const databaseAlias = {
  '@ding/database': path.resolve(__dirname, '../database/src'),
  '@ding/database/schema': path.resolve(__dirname, '../database/src/schema'),
  '@ding/database/client': path.resolve(__dirname, '../database/src/client'),
}

const sharedTestConfig = {
  globals: true as const,
  environment: 'node' as const,
  setupFiles: ['./src/__tests__/setup.ts'],
}

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          ...sharedTestConfig,
          name: 'unit',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.integration.test.ts'],
          testTimeout: 10000,
        },
        resolve: { alias: databaseAlias },
      },
      {
        test: {
          ...sharedTestConfig,
          name: 'integration',
          include: ['src/**/*.integration.test.ts'],
          testTimeout: 30000,
          fileParallelism: false,
        },
        resolve: { alias: databaseAlias },
      },
    ],
  },
})
