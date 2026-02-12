import { tv } from 'tailwind-variants'

export const typography = tv({
  base: '',
  variants: {
    variant: {
      body: 'text-neutral-900 dark:text-neutral-50',
      description: 'text-neutral-500 dark:text-neutral-400',
      alert: 'text-red-500',
      disabled: 'text-neutral-300 dark:text-neutral-600',
      fill: 'text-neutral-50 dark:text-neutral-950',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    variant: 'body',
    size: 'md',
    weight: 'normal',
  },
})
