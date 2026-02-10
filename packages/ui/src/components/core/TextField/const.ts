import { tv } from 'tailwind-variants'

export const textField = tv({
  base: [
    // 基本スタイル
    'w-full',
    'outline-none',
    'transition-colors',
    'duration-200',
    // 角丸
    'rounded-xl',
    // ライトモード - 通常状態
    'bg-neutral-50',
    'border',
    'border-neutral-200',
    'text-neutral-900',
    'placeholder:text-neutral-400',
    // ダークモード - 通常状態
    'dark:bg-neutral-900',
    'dark:border-neutral-700',
    'dark:text-neutral-50',
    'dark:placeholder:text-neutral-500',
    // フォーカス状態
    'focus:ring-2',
    'focus:ring-neutral-900/20',
    'focus:border-neutral-400',
    'dark:focus:ring-neutral-100/20',
    'dark:focus:border-neutral-500',
  ],
  variants: {
    size: {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-3', 'py-2', 'text-base'],
      lg: ['px-4', 'py-3', 'text-lg'],
    },
    error: {
      true: [
        // ライトモード - エラー状態
        'bg-red-50',
        'border-red-300',
        'focus:ring-red-500/20',
        'focus:border-red-400',
        // ダークモード - エラー状態
        'dark:bg-red-950',
        'dark:border-red-700',
        'dark:focus:ring-red-500/20',
        'dark:focus:border-red-600',
      ],
    },
    disabled: {
      true: ['opacity-50', 'cursor-not-allowed', 'bg-neutral-100', 'dark:bg-neutral-800'],
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
    disabled: false,
  },
})
