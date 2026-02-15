import { tv } from 'tailwind-variants'

export const formDetailPage = tv({
  slots: {
    container: ['min-h-dvh', 'p-6', 'max-w-3xl', 'mx-auto'],
    header: ['my-6'],
    title: ['text-3xl', 'font-bold', 'text-neutral-900', 'dark:text-neutral-50'],
    tabWrapper: ['mb-10'],
    tabContent: ['mt-6'],
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
    emptyState: ['flex', 'flex-col', 'items-center', 'justify-center', 'py-16', 'text-center'],
    emptyMessage: ['text-neutral-500', 'dark:text-neutral-400'],
  },
})
