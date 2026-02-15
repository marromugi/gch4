import { tv } from 'tailwind-variants'

export const thinkingLoader = tv({
  slots: {
    wrapper: ['flex', 'w-full', 'mb-3', 'justify-start'],
    bubble: [
      'px-4',
      'py-3',
      'text-neutral-900',
      'dark:text-neutral-100',
      'flex',
      'items-center',
      'justify-center',
    ],
    canvas: ['block'],
    // CSSフォールバック用
    fallback: ['flex', 'items-center', 'gap-1'],
    dot: ['w-2', 'h-2', 'rounded-full', 'bg-current', 'animate-pulse'],
  },
})
