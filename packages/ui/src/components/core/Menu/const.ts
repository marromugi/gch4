import { tv } from 'tailwind-variants'

export const menu = tv({
  slots: {
    wrapper: ['relative', 'inline-flex'],
    content: [
      'absolute',
      'z-50',
      'flex',
      'flex-col',
      'overflow-hidden',
      'rounded-xl',
      'border',
      'p-1',
      'shadow-lg',
      // ライトモード
      'border-neutral-200',
      'bg-white',
      'shadow-black/10',
      // ダークモード
      'dark:border-neutral-700',
      'dark:bg-neutral-800',
      'dark:shadow-black/20',
    ],
  },
  variants: {
    placement: {
      top: {
        content: ['bottom-full', 'mb-1'],
      },
      bottom: {
        content: ['top-full', 'mt-1'],
      },
      left: {
        content: ['right-full', 'mr-1'],
      },
      right: {
        content: ['left-full', 'ml-1'],
      },
    },
    align: {
      start: {},
      center: {},
      end: {},
    },
  },
  compoundVariants: [
    // placement=top × align
    {
      placement: 'top',
      align: 'start',
      className: { content: ['left-0'] },
    },
    {
      placement: 'top',
      align: 'center',
      className: { content: ['left-1/2', '-translate-x-1/2'] },
    },
    {
      placement: 'top',
      align: 'end',
      className: { content: ['right-0'] },
    },
    // placement=bottom × align
    {
      placement: 'bottom',
      align: 'start',
      className: { content: ['left-0'] },
    },
    {
      placement: 'bottom',
      align: 'center',
      className: { content: ['left-1/2', '-translate-x-1/2'] },
    },
    {
      placement: 'bottom',
      align: 'end',
      className: { content: ['right-0'] },
    },
    // placement=left × align
    {
      placement: 'left',
      align: 'start',
      className: { content: ['top-0'] },
    },
    {
      placement: 'left',
      align: 'center',
      className: { content: ['top-1/2', '-translate-y-1/2'] },
    },
    {
      placement: 'left',
      align: 'end',
      className: { content: ['bottom-0'] },
    },
    // placement=right × align
    {
      placement: 'right',
      align: 'start',
      className: { content: ['top-0'] },
    },
    {
      placement: 'right',
      align: 'center',
      className: { content: ['top-1/2', '-translate-y-1/2'] },
    },
    {
      placement: 'right',
      align: 'end',
      className: { content: ['bottom-0'] },
    },
  ],
  defaultVariants: {
    placement: 'bottom',
    align: 'start',
  },
})

export const menuItem = tv({
  base: [
    'group',
    'relative',
    'flex',
    'w-full',
    'items-center',
    'gap-3',
    'px-3',
    'py-2',
    'text-left',
    'text-sm',
    'rounded-lg',
    'font-medium',
    'cursor-pointer',
    'select-none',
    'outline-none',
    // ライトモード
    'text-neutral-700',
    'hover:bg-neutral-100',
    'focus:bg-neutral-100',
    'focus-visible:bg-neutral-100',
    // ダークモード
    'dark:text-neutral-200',
    'dark:hover:bg-neutral-700',
    'dark:focus:bg-neutral-700',
    'dark:focus-visible:bg-neutral-700',
  ],
  variants: {
    destructive: {
      true: [
        'text-red-600',
        'hover:bg-red-50',
        'focus:bg-red-50',
        'dark:text-red-400',
        'dark:hover:bg-red-900/30',
        'dark:focus:bg-red-900/30',
      ],
    },
    disabled: {
      true: ['opacity-50', 'cursor-not-allowed', 'pointer-events-none'],
    },
  },
  defaultVariants: {
    destructive: false,
    disabled: false,
  },
})

/** メニューアイテム内のアイコンサイズ */
export const menuItemIconSize = 'w-5 h-5'

export const menuDivider = tv({
  base: [
    'my-1',
    'mx-1',
    'h-px',
    'border-0',
    // ライトモード
    'bg-neutral-200',
    // ダークモード
    'dark:bg-neutral-700',
  ],
})

export const menuShortcut = tv({
  base: [
    'ml-auto',
    'text-xs',
    // ライトモード
    'text-neutral-400',
    // ダークモード
    'dark:text-neutral-500',
  ],
})

/** サブメニューコンテナのスタイル */
export const menuSub = tv({
  slots: {
    trigger: [
      'group',
      'relative',
      'flex',
      'w-full',
      'items-center',
      'gap-3',
      'px-3',
      'py-2',
      'text-left',
      'text-sm',
      'font-medium',
      'cursor-pointer',
      'select-none',
      'outline-none',
      'transition-colors',
      'duration-150',
      // ライトモード
      'text-neutral-700',
      'hover:bg-neutral-100',
      'focus:bg-neutral-100',
      // ダークモード
      'dark:text-neutral-200',
      'dark:hover:bg-neutral-700',
      'dark:focus:bg-neutral-700',
    ],
    content: [
      'absolute',
      'left-full',
      'top-0',
      'z-50',
      'ml-1',
      'flex',
      'flex-col',
      'overflow-hidden',
      'rounded-xl',
      'border',
      'py-1',
      'shadow-lg',
      // ライトモード
      'border-neutral-200',
      'bg-white',
      'shadow-black/10',
      // ダークモード
      'dark:border-neutral-700',
      'dark:bg-neutral-800',
      'dark:shadow-black/20',
    ],
  },
  variants: {
    disabled: {
      true: {
        trigger: ['opacity-50', 'cursor-not-allowed', 'pointer-events-none'],
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
})
