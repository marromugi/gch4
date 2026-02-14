import { tv } from 'tailwind-variants'

export const formEditPage = tv({
  slots: {
    container: ['min-h-dvh', 'p-6', 'max-w-3xl', 'mx-auto'],
    header: ['mb-6'],
    section: ['mb-8'],
    sectionHeader: ['mb-4'],
    fieldList: ['flex', 'flex-col', 'gap-4'],
    footer: [
      'flex',
      'items-center',
      'justify-end',
      'gap-2',
      'pt-6',
      'border-t',
      'border-neutral-200',
      'dark:border-neutral-700',
    ],
    loadingState: ['flex', 'items-center', 'justify-center', 'py-16'],
    spinner: [
      'h-8',
      'w-8',
      'animate-spin',
      'rounded-full',
      'border-4',
      'border-neutral-300',
      'border-t-neutral-900',
      'dark:border-neutral-600',
      'dark:border-t-neutral-50',
    ],
  },
})

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
