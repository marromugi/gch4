import { tv } from 'tailwind-variants'

export const extractionReview = tv({
  slots: {
    container: ['w-full', 'max-w-2xl', 'mx-auto', 'p-6'],
    title: ['mb-6'],
    fieldList: ['space-y-4', 'mb-8'],
    fieldItem: [
      'p-4',
      'rounded-lg',
      'border',
      'border-neutral-200',
      'dark:border-neutral-700',
      'bg-white',
      'dark:bg-neutral-900',
    ],
    fieldLabel: ['mb-2'],
    actions: ['flex', 'justify-end'],
  },
})
