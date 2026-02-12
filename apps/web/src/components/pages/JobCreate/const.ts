import { tv } from 'tailwind-variants'

export const jobCreatePage = tv({
  slots: {
    container: ['min-h-dvh', 'p-6', 'max-w-3xl', 'mx-auto'],
    header: ['mb-6'],
    title: [],
    tabWrapper: ['mb-8'],
    stepContent: ['mb-8'],
    footer: [
      'flex',
      'items-center',
      'justify-between',
      'pt-6',
      'border-t',
      'border-neutral-200',
      'dark:border-neutral-700',
    ],
  },
})
