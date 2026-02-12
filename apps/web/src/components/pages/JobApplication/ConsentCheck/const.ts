import { tv } from 'tailwind-variants'

export const consentCheck = tv({
  slots: {
    container: ['w-full', 'max-w-2xl', 'mx-auto', 'p-6'],
    title: ['mb-6'],
    description: ['mb-8'],
    checkboxGroup: ['space-y-4', 'mb-8'],
    checkboxItem: [
      'flex',
      'items-start',
      'gap-3',
      'p-4',
      'rounded-lg',
      'border',
      'border-neutral-200',
      'dark:border-neutral-700',
      'bg-white',
      'dark:bg-neutral-900',
    ],
    actions: ['flex', 'justify-end'],
  },
})
