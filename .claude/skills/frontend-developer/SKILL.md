---
name: frontend-developer
description: Frontend development best practices and guidelines for this project.
---

# Frontend Development Guidelines

## Core Rules

| Rule                | Description                           |
| ------------------- | ------------------------------------- |
| Directory Structure | Follow CLAUDE.md strictly             |
| Animation           | Use `motion/react` actively           |
| Data Fetching       | Use orval-generated clients only      |
| Testing             | All utils and hooks MUST have tests   |
| UI Components       | Use `@ding/ui` components             |
| i18n                | All text uses `t()` from `@ding/i18n` |

## Animation (motion/react)

```typescript
import { motion, AnimatePresence } from 'motion/react'
```

| Use Case                      | Approach                               |
| ----------------------------- | -------------------------------------- |
| Enter/exit, page transitions  | `motion` + `AnimatePresence`           |
| Scroll-linked, gestures, drag | `useScroll`, `whileHover`, `drag`      |
| Simple hover/loading          | Tailwind (`transition-*`, `animate-*`) |

## Data Fetching (orval)

```typescript
// Always use generated clients
import { useListTweets, useCreateTweet } from '@/lib/api/generated/tweet/tweet'

// Storybook MSW mocking
import { getListTweetsMockHandler } from '@/lib/api/generated/tweet/tweet.msw'
```

## Storybook + MSW

```typescript
import { getListTweetsMockHandler } from '@/lib/api/generated/tweet/tweet.msw'

export const Default: Story = {
  parameters: {
    msw: { handlers: [getListTweetsMockHandler()] },
  },
}

export const Empty: Story = {
  parameters: {
    msw: { handlers: [getListTweetsMockHandler({ tweets: [], meta: { total: 0 } })] },
  },
}
```

| Pattern       | Usage                                           |
| ------------- | ----------------------------------------------- |
| Default mock  | `getXxxMockHandler()` - faker.js auto-generated |
| Custom data   | `getXxxMockHandler({ ...customData })`          |
| Response mock | `getXxxResponseMock()` - get mock data only     |

## Testing

**Utils and hooks MUST have tests.**

```
utils/formatDate/
├── formatDate.ts
└── formatDate.test.ts    # REQUIRED

hooks/useDebounce/
├── useDebounce.ts
└── useDebounce.test.ts   # REQUIRED
```

## Checklist

- [ ] Directory structure follows CLAUDE.md
- [ ] `motion/react` for animations
- [ ] orval clients for API calls
- [ ] Tests for utils/hooks
- [ ] `t()` for all text
- [ ] `dark:` variants for colors
- [ ] `@ding/ui` components
