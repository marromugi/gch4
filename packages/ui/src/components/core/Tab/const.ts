import { tv } from 'tailwind-variants'

export const tab = tv({
  slots: {
    root: ['relative', 'inline-flex', 'items-center', 'bg-neutral-200', 'dark:bg-neutral-900'],
    trigger: [
      'relative',
      'z-10',
      'inline-flex',
      'items-center',
      'justify-center',
      'cursor-pointer',
      'select-none',
      'font-medium',
      'transition-colors',
      'duration-200',
      'text-neutral-500',
      'dark:text-neutral-400',
      'hover:text-neutral-900',
      'dark:hover:text-neutral-50',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-neutral-400',
      'focus-visible:ring-offset-1',
    ],
    triggerActive: ['text-neutral-900', 'dark:text-neutral-50'],
    pill: ['absolute', 'bg-white', 'dark:bg-neutral-700', 'shadow-sm'],
  },
  variants: {
    size: {
      sm: {
        root: ['rounded-full', 'p-0.5', 'gap-0.5'],
        trigger: ['px-3', 'py-1', 'text-xs', 'rounded-full'],
        pill: ['rounded-full'],
      },
      md: {
        root: ['rounded-full', 'p-1', 'gap-1'],
        trigger: ['px-4', 'py-1.5', 'text-sm', 'rounded-full'],
        pill: ['rounded-full'],
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
