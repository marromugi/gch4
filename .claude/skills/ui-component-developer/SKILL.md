---
name: ui-component-developer
description: You MUST use when you create shared UI React components.(@ding/ui)
---

# Component Creation Rules

This document defines the standard patterns for creating React components in this project, based on the BentoGrid implementation.

## File Structure

Each component should be organized in its own directory with the following structure:

```
src/components/
└── ComponentName/
    ├── index.ts          # Barrel export (public API)
    ├── type.ts           # TypeScript interfaces and types
    ├── const.ts          # Constants, styling variants if you need(tailwind-variants)
    ├── ComponentName.stories.tsx  # Storybook file
    └── ComponentName.tsx # Main component implementation
```

## File Conventions

### 1. `type.ts` - Type Definitions

- Export all interfaces and types used by the component
- Props interface naming: `{ComponentName}Props`
- Use strict TypeScript typing with literal unions for constrained values

```typescript
export interface ComponentNameProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

### 2. `const.ts` - Styling Constants

- Use `tailwind-variants` (TV) for style composition
- Export a camelCase function named after the component
- Define: base styles, variants, and defaultVariants

```typescript
import { tv } from 'tailwind-variants'

export const componentName = tv({
  base: '/* base tailwind classes */',
  variants: {
    variant: {
      primary: '/* primary variant classes */',
      secondary: '/* secondary variant classes */',
    },
    size: {
      sm: '/* small size classes */',
      md: '/* medium size classes */',
      lg: '/* large size classes */',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})
```

### 3. `ComponentName.tsx` - Main Component

- Use default export for the component
- Import types from `./type`
- Import styling function from `./const`
- Use `cn()` utility from `@/util/cn` to merge custom className
- Keep the component pure and presentational

```typescript
import { cn } from "@/util/cn";
import { componentName } from "./const";
import type { ComponentNameProps } from "./type";

export default function ComponentName({
  children,
  variant,
  size,
  className,
}: ComponentNameProps) {
  return (
    <div className={cn(componentName({ variant, size }), className)}>
      {children}
    </div>
  );
}
```

### 4. `ComponentName.stories.tsx` - Storybook File

- File naming: `{ComponentName}.stories.tsx`
- Use CSF3 (Component Story Format 3) syntax
- Export a `meta` object as default with component metadata
- Export individual stories as named exports
- Include stories for all variants and edge cases

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import ComponentName from './ComponentName'

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {
    children: 'Content',
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary Variant',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Variant',
    variant: 'secondary',
  },
}
```

### 5. `index.ts` - Barrel Export

- Re-export the default component and types
- Single entry point for consumers

```typescript
export * from './ComponentName'
export { default } from './ComponentName'
```

## Naming Conventions

| Item                   | Convention             | Example                 |
| ---------------------- | ---------------------- | ----------------------- |
| Directory              | PascalCase             | `BentoGrid/`            |
| Component file         | PascalCase.tsx         | `BentoGrid.tsx`         |
| Story file             | PascalCase.stories.tsx | `BentoGrid.stories.tsx` |
| Type file              | lowercase              | `type.ts`               |
| Constants file         | lowercase              | `const.ts`              |
| Props interface        | PascalCase + Props     | `BentoGridProps`        |
| Style variant function | camelCase              | `bentoGrid`             |
| Variant keys           | camelCase              | `columns`, `gap`        |

## Styling Guidelines

### Use tailwind-variants for:

- Composable, variant-based styling
- Type-safe style props
- Default values for optional props

### Dark Mode:

- Use `dark:` prefix for dark mode styles
- Always provide both light and dark mode variants for colors
- Use semantic color approach (e.g., background, foreground) instead of hardcoded colors

```typescript
// Good - includes dark mode support
export const card = tv({
  base: 'rounded-lg',
  variants: {
    variant: {
      elevated: ['bg-white shadow-md', 'dark:bg-neutral-900 dark:shadow-lg'],
      outlined: ['border border-neutral-200', 'dark:border-neutral-700'],
      filled: ['bg-neutral-100', 'dark:bg-neutral-800'],
    },
  },
})

// Good - text colors with dark mode
base: ['text-neutral-900', 'dark:text-neutral-50']

// Avoid - missing dark mode
base: 'bg-white text-black' // No dark mode support!
```

### Dark Mode Color Conventions:

| Light Mode             | Dark Mode                                      |
| ---------------------- | ---------------------------------------------- |
| `bg-white`             | `dark:bg-neutral-900` or `dark:bg-neutral-950` |
| `bg-neutral-50`        | `dark:bg-neutral-900`                          |
| `bg-neutral-100`       | `dark:bg-neutral-800`                          |
| `text-neutral-900`     | `dark:text-neutral-50`                         |
| `text-neutral-600`     | `dark:text-neutral-400`                        |
| `border-neutral-200`   | `dark:border-neutral-700`                      |
| `hover:bg-neutral-100` | `dark:hover:bg-neutral-800`                    |

### Responsive Design:

- Mobile-first approach
- Define breakpoints in variants when needed

```typescript
base: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
```

### Class Merging:

- Always use `cn()` to merge the generated classes with custom `className` prop
- This allows consumers to override styles when needed

## Animation Guidelines

### Progressive Enhancement with Motion

When adding animations, use `motion` (Framer Motion) progressively. Start with simple Tailwind animations and escalate to motion when needed.

1. **Simple animations**: Use Tailwind's built-in animation utilities
2. **Complex animations**: Use `motion`

```typescript
// 1. Simple animations - Use Tailwind
export const button = tv({
  base: ['transition-colors duration-200', 'hover:bg-neutral-100', 'dark:hover:bg-neutral-800'],
})

// Common Tailwind animation utilities:
// - transition-all, transition-colors, transition-opacity
// - duration-150, duration-200, duration-300
// - animate-pulse, animate-spin, animate-bounce
// - ease-in, ease-out, ease-in-out
```

```typescript
// 2. Complex animations - Use motion
import { motion } from "motion/react";

export default function AnimatedCard({ children }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### When to Use Each Approach

| Use Case                  | Recommended                                       |
| ------------------------- | ------------------------------------------------- |
| Hover/focus color changes | Tailwind (`transition-colors`)                    |
| Simple scale transforms   | Tailwind (`hover:scale-105 transition-transform`) |
| Loading indicators        | Tailwind (`animate-spin`, `animate-pulse`)        |
| Enter/exit animations     | motion (`initial`, `animate`, `exit`)             |
| Scroll-linked animations  | motion (`useScroll`, `useTransform`)              |
| Complex sequences         | motion (`stagger`, `variants`)                    |
| Gesture interactions      | motion (`whileHover`, `whileTap`, `drag`)         |

### Motion Import Convention

```typescript
// Import from motion/react
import { motion, AnimatePresence } from 'motion/react'

// Hooks
import { useScroll, useTransform, useSpring } from 'motion/react'
```

## Props Guidelines

1. **Required props**: Only `children` when the component is a container
2. **Optional props**: All styling/behavior props with sensible defaults
3. **className**: Always include for customization
4. **Literal unions**: Use for constrained values instead of `string` or `number`

```typescript
// Good
columns?: 2 | 3 | 4;

// Avoid
columns?: number;
```

## Component Principles

1. **Single Responsibility**: Each component does one thing well
2. **Composition over Configuration**: Accept children for flexibility
3. **Pure & Presentational**: No business logic in UI components
4. **Minimal API Surface**: Only expose what's needed
5. **Sensible Defaults**: Work out-of-the-box without props

## Import Paths

```typescript
// Utility functions
import { cn } from '@/util/cn'

// Component internals
import { componentName } from './const'
import type { ComponentNameProps } from './type'
```

## Example: Creating a New Component

To create a `Card` component:

1. Create directory: `src/components/Card/`

2. Create `type.ts`:

```typescript
export interface CardProps {
  children: React.ReactNode
  variant?: 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}
```

3. Create `const.ts`:

```typescript
import { tv } from 'tailwind-variants'

export const card = tv({
  base: 'rounded-lg',
  variants: {
    variant: {
      elevated: ['bg-white shadow-md', 'dark:bg-neutral-900 dark:shadow-lg'],
      outlined: ['border border-neutral-200', 'dark:border-neutral-700'],
      filled: ['bg-neutral-100', 'dark:bg-neutral-800'],
    },
    padding: {
      none: 'p-0',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
  },
})
```

4. Create `Card.tsx`:

```typescript
import { cn } from "@/util/cn";
import { card } from "./const";
import type { CardProps } from "./type";

export default function Card({
  children,
  variant,
  padding,
  className,
}: CardProps) {
  return (
    <div className={cn(card({ variant, padding }), className)}>
      {children}
    </div>
  );
}
```

5. Create `index.ts`:

```typescript
export * from './Card'
export { default } from './Card'
```
