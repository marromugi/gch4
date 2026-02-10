import { tv } from 'tailwind-variants'

export const radioGroup = tv({
  base: ['flex'],
  variants: {
    orientation: {
      horizontal: ['flex-row', 'flex-wrap', 'gap-4'],
      vertical: ['flex-col', 'gap-2'],
    },
    disabled: {
      true: ['opacity-50', 'cursor-not-allowed'],
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    disabled: false,
  },
})

export const radioGroupItem = tv({
  slots: {
    wrapper: ['group', 'inline-flex', 'items-center', 'cursor-pointer', 'select-none'],
    indicator: [
      'relative',
      'shrink-0',
      'rounded-full',
      'border-2',
      'transition-[border-color]',
      'duration-200',
      // ライトモード
      'border-neutral-300',
      'bg-white',
      // ダークモード
      'dark:border-neutral-600',
      'dark:bg-neutral-800',
      // フォーカス時
      'group-focus-within:ring-2',
      'group-focus-within:ring-neutral-900/20',
      'group-focus-within:ring-offset-2',
      'dark:group-focus-within:ring-neutral-100/20',
      'dark:group-focus-within:ring-offset-neutral-900',
    ],
    dot: [
      'absolute',
      'inset-0',
      'm-auto',
      'rounded-full',
      'transition-transform',
      'duration-200',
      // ライトモード
      'bg-neutral-900',
      // ダークモード
      'dark:bg-neutral-100',
      // 初期状態（非選択時）
      'scale-0',
    ],
    label: [
      'transition-colors',
      'duration-200',
      // ライトモード
      'text-neutral-700',
      // ダークモード
      'dark:text-neutral-200',
    ],
    input: ['sr-only'],
  },
  variants: {
    size: {
      sm: {
        wrapper: ['gap-2'],
        indicator: ['w-4', 'h-4'],
        dot: ['w-2', 'h-2'],
        label: ['text-sm'],
      },
      md: {
        wrapper: ['gap-3'],
        indicator: ['w-5', 'h-5'],
        dot: ['w-2.5', 'h-2.5'],
        label: ['text-base'],
      },
    },
    checked: {
      true: {
        indicator: ['border-neutral-900', 'dark:border-neutral-100'],
        dot: ['scale-100'],
      },
    },
    disabled: {
      true: {
        wrapper: ['cursor-not-allowed', 'pointer-events-none'],
        indicator: ['opacity-50'],
        label: ['opacity-50'],
      },
    },
  },
  compoundVariants: [
    // ホバー時（未選択時のみ）
    {
      checked: false,
      disabled: false,
      className: {
        indicator: ['group-hover:border-neutral-400', 'dark:group-hover:border-neutral-500'],
      },
    },
    // checked + disabled の組み合わせ
    {
      checked: true,
      disabled: true,
      className: {
        indicator: ['border-neutral-400', 'dark:border-neutral-600'],
        dot: ['bg-neutral-400', 'dark:bg-neutral-600'],
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    checked: false,
    disabled: false,
  },
})
