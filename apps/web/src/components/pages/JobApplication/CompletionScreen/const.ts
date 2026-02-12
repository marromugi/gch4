import { tv } from 'tailwind-variants'

export const completionScreen = tv({
  slots: {
    container: ['w-full', 'max-w-lg', 'mx-auto', 'p-6', 'text-center'],
    icon: ['text-5xl', 'mb-4'],
    title: ['mb-4'],
    applicationId: [
      'inline-block',
      'px-3',
      'py-1',
      'rounded',
      'bg-neutral-100',
      'dark:bg-neutral-800',
      'font-mono',
      'text-sm',
    ],
  },
})
