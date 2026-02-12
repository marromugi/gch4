import { tv } from 'tailwind-variants'

export const chatPanel = tv({
  slots: {
    container: ['flex', 'flex-col', 'h-full'],
    messageList: ['flex-1', 'overflow-y-auto', 'p-4', 'space-y-1'],
    inputArea: [
      'border-t',
      'border-neutral-200',
      'dark:border-neutral-800',
      'bg-white',
      'dark:bg-neutral-900',
      'p-4',
    ],
    inputRow: ['flex', 'gap-3', 'items-end'],
    completeMessage: [
      'text-center',
      'py-4',
      'px-6',
      'bg-neutral-100',
      'dark:bg-neutral-800',
      'border-t',
      'border-neutral-200',
      'dark:border-neutral-700',
    ],
  },
})
