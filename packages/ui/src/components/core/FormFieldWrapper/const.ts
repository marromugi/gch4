import { tv } from 'tailwind-variants'

export const formFieldWrapper = tv({
  slots: {
    container: ['flex', 'flex-col', 'gap-1.5'],
    labelWrapper: ['flex', 'items-baseline', 'gap-1'],
    label: ['text-base', 'font-semibold', 'text-neutral-900', 'dark:text-neutral-50'],
    requiredMark: ['size-3'],
    description: ['text-sm', 'text-neutral-500', 'dark:text-neutral-400'],
    content: ['mt-0.5'],
    error: ['text-sm', 'text-red-500', 'mt-1'],
  },
  variants: {
    disabled: {
      true: {
        label: ['text-neutral-300', 'dark:text-neutral-600'],
        description: ['text-neutral-300', 'dark:text-neutral-600'],
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
})
