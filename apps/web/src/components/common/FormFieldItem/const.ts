import { tv } from 'tailwind-variants'

export const formFieldItem = tv({
  slots: {
    fieldItem: [
      'flex',
      'items-start',
      'gap-3',
      'p-4',
      'rounded-xl',
      'border',
      'border-neutral-200',
      'dark:border-neutral-700',
      'bg-neutral-50',
      'dark:bg-neutral-900',
    ],
    fieldInputs: ['flex-1', 'flex', 'flex-col', 'gap-3'],
    deleteButton: ['shrink-0', 'mt-1'],
  },
})
