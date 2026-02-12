import { tv } from 'tailwind-variants'

export const chatBubble = tv({
  slots: {
    wrapper: ['flex', 'w-full', 'mb-3'],
    bubble: ['max-w-[80%]', 'rounded-2xl', 'px-4', 'py-3', 'text-sm', 'leading-relaxed'],
  },
  variants: {
    role: {
      user: {
        wrapper: ['justify-end'],
        bubble: [
          'bg-neutral-900',
          'dark:bg-neutral-100',
          'text-white',
          'dark:text-neutral-900',
          'rounded-br-sm',
        ],
      },
      assistant: {
        wrapper: ['justify-start'],
        bubble: [
          'bg-white',
          'dark:bg-neutral-800',
          'text-neutral-900',
          'dark:text-neutral-100',
          'border',
          'border-neutral-200',
          'dark:border-neutral-700',
          'rounded-bl-sm',
        ],
      },
      system: {
        wrapper: ['justify-center'],
        bubble: [
          'bg-neutral-100',
          'dark:bg-neutral-800',
          'text-neutral-500',
          'dark:text-neutral-400',
          'text-xs',
          'text-center',
        ],
      },
    },
  },
  defaultVariants: {
    role: 'assistant',
  },
})
