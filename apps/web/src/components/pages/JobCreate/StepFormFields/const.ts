import { tv } from 'tailwind-variants'

export const stepFormFields = tv({
  slots: {
    container: ['flex', 'flex-col', 'gap-6'],
    fieldList: ['flex', 'flex-col', 'gap-4'],
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
    fieldRow: ['flex', 'items-center', 'gap-3'],
    deleteButton: ['shrink-0', 'mt-1'],
    addButton: [],
    errorMessage: ['text-sm', 'text-red-500', 'dark:text-red-400'],
  },
})
