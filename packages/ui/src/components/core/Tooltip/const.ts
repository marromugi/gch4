import { tv } from 'tailwind-variants'

export const tooltip = tv({
  slots: {
    wrapper: ['relative', 'inline-flex'],
    content: [
      'absolute',
      'z-50',
      'px-2.5',
      'py-1.5',
      'rounded-md',
      'text-xs',
      'font-medium',
      'whitespace-nowrap',
      'pointer-events-none',
      'bg-neutral-900',
      'text-neutral-50',
      'dark:bg-neutral-50',
      'dark:text-neutral-900',
      'shadow-md',
    ],
    arrow: ['absolute', 'w-2', 'h-2', 'rotate-45', 'bg-neutral-900', 'dark:bg-neutral-50'],
  },
  variants: {
    placement: {
      top: {
        content: ['bottom-full', 'mb-2'],
        arrow: ['bottom-[-4px]'],
      },
      bottom: {
        content: ['top-full', 'mt-2'],
        arrow: ['top-[-4px]'],
      },
      left: {
        content: ['right-full', 'mr-2'],
        arrow: ['right-[-4px]'],
      },
      right: {
        content: ['left-full', 'ml-2'],
        arrow: ['left-[-4px]'],
      },
    },
    align: {
      start: {},
      center: {},
      end: {},
    },
  },
  compoundVariants: [
    // placement=top/bottom × align
    {
      placement: 'top',
      align: 'start',
      className: { content: ['left-0'], arrow: ['left-3'] },
    },
    {
      placement: 'top',
      align: 'center',
      className: {
        content: ['left-1/2', '-translate-x-1/2'],
        arrow: ['left-1/2', '-translate-x-1/2'],
      },
    },
    {
      placement: 'top',
      align: 'end',
      className: { content: ['right-0'], arrow: ['right-3'] },
    },
    {
      placement: 'bottom',
      align: 'start',
      className: { content: ['left-0'], arrow: ['left-3'] },
    },
    {
      placement: 'bottom',
      align: 'center',
      className: {
        content: ['left-1/2', '-translate-x-1/2'],
        arrow: ['left-1/2', '-translate-x-1/2'],
      },
    },
    {
      placement: 'bottom',
      align: 'end',
      className: { content: ['right-0'], arrow: ['right-3'] },
    },
    // placement=left/right × align
    {
      placement: 'left',
      align: 'start',
      className: { content: ['top-0'], arrow: ['top-3'] },
    },
    {
      placement: 'left',
      align: 'center',
      className: {
        content: ['top-1/2', '-translate-y-1/2'],
        arrow: ['top-1/2', '-translate-y-1/2'],
      },
    },
    {
      placement: 'left',
      align: 'end',
      className: { content: ['bottom-0'], arrow: ['bottom-3'] },
    },
    {
      placement: 'right',
      align: 'start',
      className: { content: ['top-0'], arrow: ['top-3'] },
    },
    {
      placement: 'right',
      align: 'center',
      className: {
        content: ['top-1/2', '-translate-y-1/2'],
        arrow: ['top-1/2', '-translate-y-1/2'],
      },
    },
    {
      placement: 'right',
      align: 'end',
      className: { content: ['bottom-0'], arrow: ['bottom-3'] },
    },
  ],
  defaultVariants: {
    placement: 'top',
    align: 'center',
  },
})
