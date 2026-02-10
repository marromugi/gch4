import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL ?? ''

// リモート Turso (libsql:// or https://) かどうかを判定
const isRemoteTurso = databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('https://')

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: isRemoteTurso ? 'turso' : 'sqlite',
  dbCredentials: isRemoteTurso
    ? { url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN }
    : { url: databaseUrl },
})
