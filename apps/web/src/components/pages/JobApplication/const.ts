import { tv } from 'tailwind-variants'

export const jobApplicationPage = tv({
  slots: {
    container: ['min-h-dvh', 'bg-neutral-50', 'dark:bg-neutral-950'],
    header: [
      'border-b',
      'border-neutral-200',
      'dark:border-neutral-800',
      'bg-white',
      'dark:bg-neutral-900',
      'px-6',
      'py-4',
    ],
    main: ['flex-1', 'flex', 'flex-col'],
    chatLayout: ['flex', 'flex-1', 'h-[calc(100dvh-64px)]'],
    chatArea: ['flex-1', 'flex', 'flex-col', 'min-w-0'],
    sidebar: [
      'w-80',
      'border-l',
      'border-neutral-200',
      'dark:border-neutral-800',
      'bg-white',
      'dark:bg-neutral-900',
      'overflow-y-auto',
      'hidden',
      'lg:block',
    ],
    centerContent: ['flex-1', 'flex', 'items-center', 'justify-center', 'p-6'],
    loadingState: ['flex', 'items-center', 'justify-center', 'min-h-dvh'],
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
