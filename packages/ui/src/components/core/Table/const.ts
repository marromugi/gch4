import { tv } from 'tailwind-variants'

export const table = tv({
  slots: {
    wrapper: ['w-full', 'overflow-auto'],
    root: ['w-full', 'caption-bottom', 'text-sm', 'border-collapse'],
  },
  variants: {
    variant: {
      default: {},
      striped: {},
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export const tableHeader = tv({
  base: [
    '[&_tr]:border-b',
    // ライトモード
    '[&_tr]:border-neutral-200',
    // ダークモード
    'dark:[&_tr]:border-neutral-700',
  ],
})

export const tableBody = tv({
  base: ['[&_tr:last-child]:border-0'],
  variants: {
    variant: {
      default: {},
      striped: [
        // ライトモード
        '[&_tr:nth-child(even)]:bg-neutral-50',
        // ダークモード
        'dark:[&_tr:nth-child(even)]:bg-neutral-800/50',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const tableFooter = tv({
  base: [
    'border-t',
    'font-medium',
    // ライトモード
    'border-neutral-200',
    'bg-neutral-50',
    // ダークモード
    'dark:border-neutral-700',
    'dark:bg-neutral-800/50',
  ],
})

export const tableRow = tv({
  base: [
    'border-b',
    'transition-colors',
    // ライトモード
    'border-neutral-200',
    'hover:bg-neutral-100/50',
    // ダークモード
    'dark:border-neutral-700',
    'dark:hover:bg-neutral-800/50',
  ],
  variants: {
    selected: {
      true: [
        // ライトモード
        'bg-neutral-100',
        // ダークモード
        'dark:bg-neutral-800',
      ],
    },
  },
  defaultVariants: {
    selected: false,
  },
})

export const tableHead = tv({
  base: [
    'h-10',
    'text-left',
    'align-middle',
    'font-medium',
    // ライトモード
    'text-neutral-500',
    // ダークモード
    'dark:text-neutral-400',
  ],
  variants: {
    size: {
      sm: ['px-2', 'py-1'],
      md: ['px-4', 'py-2'],
      lg: ['px-6', 'py-3'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const tableCell = tv({
  base: [
    'align-middle',
    // ライトモード
    'text-neutral-900',
    // ダークモード
    'dark:text-neutral-50',
  ],
  variants: {
    size: {
      sm: ['px-2', 'py-1'],
      md: ['px-4', 'py-3'],
      lg: ['px-6', 'py-4'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const tableCaption = tv({
  base: [
    'mt-4',
    'text-sm',
    // ライトモード
    'text-neutral-500',
    // ダークモード
    'dark:text-neutral-400',
  ],
})
