import { tv } from 'tailwind-variants'

export const modal = tv({
  slots: {
    overlay: [
      'fixed',
      'inset-0',
      'z-50',
      'flex',
      'items-center',
      'justify-center',
      'p-4',
      'bg-black/50',
    ],
    content: [
      'relative',
      'flex',
      'flex-col',
      'max-h-[90vh]',
      'overflow-hidden',
      'rounded-xl',
      'shadow-xl',
      'bg-white',
      'dark:bg-neutral-900',
    ],
    closeButton: [
      'absolute',
      'top-3',
      'right-3',
      'z-10',
      'flex',
      'items-center',
      'justify-center',
      'w-8',
      'h-8',
      'rounded-lg',
      'cursor-pointer',
      'transition-colors',
      'text-neutral-500',
      'hover:bg-neutral-100',
      'hover:text-neutral-700',
      'dark:text-neutral-400',
      'dark:hover:bg-neutral-800',
      'dark:hover:text-neutral-200',
    ],
  },
  variants: {
    size: {
      sm: {
        content: ['w-full', 'max-w-sm'],
      },
      md: {
        content: ['w-full', 'max-w-md'],
      },
      lg: {
        content: ['w-full', 'max-w-lg'],
      },
      xl: {
        content: ['w-full', 'max-w-xl'],
      },
      full: {
        content: ['w-full', 'max-w-[calc(100vw-2rem)]', 'h-[calc(100vh-2rem)]'],
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const modalHeader = tv({
  base: ['flex', 'items-center', 'shrink-0', 'px-4', 'py-4'],
})

export const modalBody = tv({
  base: ['flex-1', 'overflow-y-auto', 'px-4', 'py-4'],
})

export const modalFooter = tv({
  base: ['flex', 'items-center', 'justify-end', 'gap-3', 'shrink-0', 'px-4', 'py-4'],
})
