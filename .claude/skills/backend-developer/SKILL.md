---
name: backend-developer
description: Backend development best practices and guidelines for this project. Use when working on domain, API, or database layers.
---

# Backend Development Guidelines

## Core Rules

| Rule           | Description                                           |
| -------------- | ----------------------------------------------------- |
| Architecture   | Clean Architecture + DDD                              |
| Error Handling | Use `Result` type, never throw in domain layer        |
| Dependency     | Depend on interfaces, not implementations             |
| Testing        | All usecases and domain services MUST have unit tests |

## DDD Layer Structure

```
packages/domain/src/
├── domain/           # Entity, ValueObject, Repository Interface, Service
├── presentation/     # Usecase
└── infrastructure/   # Repository Implementation
```

**依存の方向**: Presentation → Domain ← Infrastructure

## Entity & Value Object

```typescript
// Entity: private constructor + create/reconstruct
class Tweet {
  private constructor(readonly id: TweetId, ...) {}
  static create(params): Result<Tweet, Error> { /* with validation */ }
  static reconstruct(params): Tweet { /* from DB, no validation */ }
}

// Value Object: immutable, equals()
class TweetContent {
  private constructor(readonly value: string) {}
  static create(value: string): Result<TweetContent, Error> { /* validation */ }
  equals(other: TweetContent): boolean { return this.value === other.value }
}
```

## Usecase Structure

```
presentation/usecase/{name}/
├── index.ts          # Barrel export
├── {name}.ts         # Error, Input, Output, Deps, Usecase class
└── {Name}.test.ts    # Unit test
```

| Item          | Convention            | Example                    |
| ------------- | --------------------- | -------------------------- |
| Usecase class | `{Name}Usecase`       | `TweetSaveUsecase`         |
| Error union   | `{Name}Error`         | `TweetSaveError`           |
| Error class   | `{Name}{Reason}Error` | `TweetSaveValidationError` |

```typescript
// Error: extends Error + readonly type as const
export class TweetSaveValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'TweetSaveValidationError'
  }
}

// Input: primitives, Deps: interfaces, Output: domain entities
export interface TweetSaveInput {
  content: string
  authorId: string
}
export interface TweetSaveDeps {
  tweetRepository: TweetRepository
}

// Usecase: constructor DI, async execute(), returns Result
export class TweetSaveUsecase {
  constructor(private readonly deps: TweetSaveDeps) {}
  async execute(input: TweetSaveInput): Promise<Result<TweetSaveOutput, TweetSaveError>> {
    // validation → create entity → save → return Result.ok/err
  }
}
```

## Testing

| Test Type   | Layer          | Dependencies      |
| ----------- | -------------- | ----------------- |
| Unit        | Domain         | None              |
| Unit        | Usecase        | Mocked Repository |
| Integration | Infrastructure | Real DB (test)    |

```typescript
// Mock pattern: Partial + vi.fn()
const mockDeps: TweetSaveDeps = {
  tweetRepository: {
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
  } as unknown as TweetRepository,
}

// Test structure
describe('TweetSaveUsecase', () => {
  describe('正常系', () => {
    /* Result.isOk() */
  })
  describe('異常系', () => {
    /* Result.isErr(), toBeInstanceOf(XxxError) */
  })
})
```

## API Layer (Hono)

APIルートは `@hono/zod-openapi` を使用して定義します。

```
apps/api/src/routes/
├── {resource}/
│   ├── index.ts           # OpenAPI route definition
│   ├── get.ts             # GET handler
│   ├── post.ts            # POST handler
│   └── [resourceId]/
│       ├── get.ts         # GET by ID handler
│       └── put.ts         # PUT handler
```

### Route Definition

```typescript
import { createRoute, z } from '@hono/zod-openapi'

// Request/Response schemas with Zod
const ParamsSchema = z.object({
  id: z.string().openapi({ example: '123' }),
})

const ResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .openapi('Resource')

// Route definition with OpenAPI metadata
export const getResourceRoute = createRoute({
  method: 'get',
  path: '/resources/{id}',
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: ResponseSchema } },
      description: 'Success',
    },
  },
})
```

### Handler Implementation

```typescript
import { OpenAPIHono } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(getResourceRoute, async (c) => {
  const { id } = c.req.valid('param')
  // Call usecase, return response
  return c.json({ id, name: 'example' }, 200)
})
```

## Checklist

- [ ] Entity: `private` constructor + `create()` / `reconstruct()`
- [ ] Error: `extends Error` + `readonly type` as const
- [ ] Input: primitives, Deps: interfaces
- [ ] `execute()` returns `Promise<Result<Output, Error>>`
- [ ] Never throw, use `Result.err()`
- [ ] Unit tests cover 正常系 + 異常系
- [ ] API routes use `@hono/zod-openapi` with proper schemas
