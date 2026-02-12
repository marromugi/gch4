import { tv } from 'tailwind-variants'

export const checkbox = tv({
  slots: {
    wrapper: ['inline-flex', 'items-center', 'gap-2'],
    input: [
      'appearance-none',
      'shrink-0',
      'rounded',
      'border',
      'border-neutral-300',
      'bg-neutral-50',
      'transition-colors',
      'duration-200',
      'cursor-pointer',
      // チェック時
      'checked:bg-neutral-900',
      'checked:border-neutral-900',
      'dark:checked:bg-neutral-100',
      'dark:checked:border-neutral-100',
      // ダークモード
      'dark:border-neutral-600',
      'dark:bg-neutral-900',
      // フォーカス
      'focus:ring-2',
      'focus:ring-neutral-900/20',
      'dark:focus:ring-neutral-100/20',
      'focus:outline-none',
      // チェックマーク（CSS background image）
      'checked:bg-[url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2016%2016%27%20fill%3D%27white%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%27%2F%3E%3C%2Fsvg%3E")]',
      'dark:checked:bg-[url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2016%2016%27%20fill%3D%27%23171717%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M12.207%204.793a1%201%200%20010%201.414l-5%205a1%201%200%2001-1.414%200l-2-2a1%201%200%20011.414-1.414L6.5%209.086l4.293-4.293a1%201%200%20011.414%200z%27%2F%3E%3C%2Fsvg%3E")]',
      'bg-center',
      'bg-no-repeat',
    ],
    label: ['text-neutral-900', 'dark:text-neutral-50', 'cursor-pointer', 'select-none'],
  },
  variants: {
    size: {
      sm: {
        input: ['h-4', 'w-4'],
        label: ['text-sm'],
      },
      md: {
        input: ['h-5', 'w-5'],
        label: ['text-base'],
      },
      lg: {
        input: ['h-6', 'w-6'],
        label: ['text-lg'],
      },
    },
    disabled: {
      true: {
        wrapper: ['opacity-50'],
        input: ['cursor-not-allowed'],
        label: ['cursor-not-allowed'],
      },
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: false,
  },
})
