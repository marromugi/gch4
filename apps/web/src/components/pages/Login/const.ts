import { tv } from 'tailwind-variants'

export const loginPage = tv({
  slots: {
    container: ['min-h-screen p-4', 'flex items-center justify-center'],
    content: ['w-full max-w-sm', 'flex flex-col items-center gap-6'],
    title: ['text-2xl font-bold', 'text-neutral-900 dark:text-neutral-50'],
    description: ['text-center', 'text-neutral-600 dark:text-neutral-400'],
    googleButton: ['w-full'],
  },
})
