import { tv } from 'tailwind-variants'

export const slidePanel = tv({
  slots: {
    overlay: ['fixed', 'inset-0', 'z-50', 'bg-black/50'],
    panel: [
      'fixed',
      'top-0',
      'right-0',
      'h-full',
      'z-50',
      'flex',
      'flex-col',
      'bg-white',
      'dark:bg-neutral-900',
      'shadow-2xl',
    ],
    header: [
      'flex',
      'items-center',
      'justify-between',
      'px-4',
      'py-4',
      'border-b',
      'border-neutral-200',
      'dark:border-neutral-700',
    ],
    closeButton: [
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
    body: ['flex-1', 'overflow-hidden'],
  },
  variants: {
    width: {
      md: { panel: ['w-full', 'max-w-md'] },
      lg: { panel: ['w-full', 'max-w-lg'] },
      xl: { panel: ['w-full', 'max-w-xl'] },
    },
  },
  defaultVariants: {
    width: 'lg',
  },
})
