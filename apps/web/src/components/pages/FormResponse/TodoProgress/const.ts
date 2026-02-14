import { tv } from 'tailwind-variants'

export const todoProgress = tv({
  slots: {
    container: ['p-4'],
    title: ['mb-4'],
    progressBar: ['w-full', 'h-2', 'bg-neutral-200', 'dark:bg-neutral-700', 'rounded-full', 'mb-4'],
    progressFill: [
      'h-full',
      'bg-neutral-900',
      'dark:bg-neutral-100',
      'rounded-full',
      'transition-all',
      'duration-300',
    ],
    list: ['space-y-2'],
    item: ['flex', 'items-center', 'gap-2', 'py-1'],
    statusIcon: [
      'flex',
      'items-center',
      'justify-center',
      'w-5',
      'h-5',
      'rounded-full',
      'text-xs',
      'shrink-0',
    ],
  },
  variants: {
    status: {
      done: {
        statusIcon: ['bg-green-100', 'dark:bg-green-900', 'text-green-600', 'dark:text-green-400'],
      },
      awaiting_answer: {
        statusIcon: [
          'bg-blue-100',
          'dark:bg-blue-900',
          'text-blue-600',
          'dark:text-blue-400',
          'animate-pulse',
        ],
      },
      validating: {
        statusIcon: [
          'bg-blue-100',
          'dark:bg-blue-900',
          'text-blue-600',
          'dark:text-blue-400',
          'animate-pulse',
        ],
      },
      needs_clarification: {
        statusIcon: ['bg-amber-100', 'dark:bg-amber-900', 'text-amber-600', 'dark:text-amber-400'],
      },
      pending: {
        statusIcon: [
          'bg-neutral-100',
          'dark:bg-neutral-700',
          'text-neutral-400',
          'dark:text-neutral-500',
        ],
      },
      manual_input: {
        statusIcon: [
          'bg-purple-100',
          'dark:bg-purple-900',
          'text-purple-600',
          'dark:text-purple-400',
        ],
      },
    },
  },
})
