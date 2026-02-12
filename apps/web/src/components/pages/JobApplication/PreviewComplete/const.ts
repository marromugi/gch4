import { tv } from 'tailwind-variants'

export const previewComplete = tv({
  slots: {
    container: ['w-full', 'max-w-lg', 'mx-auto', 'p-6', 'text-center'],
    icon: ['text-5xl', 'mb-4'],
    title: ['mb-4'],
  },
})
