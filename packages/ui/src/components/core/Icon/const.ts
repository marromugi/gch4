import { tv } from 'tailwind-variants'

export const icon = tv({
  base: ['inline-block', 'flex-shrink-0'],
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    },
    variant: {
      body: 'text-neutral-900 dark:text-neutral-50',
      description: 'text-neutral-500 dark:text-neutral-400',
      alert: 'text-red-500',
      disabled: 'text-neutral-300 dark:text-neutral-600',
      fill: 'text-neutral-50 dark:text-neutral-950',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'body',
  },
})
