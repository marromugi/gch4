import { Form } from '@ding/ui/icon'
import { tv } from 'tailwind-variants'
import type { NavItemConfig } from './type'

export const navItems: NavItemConfig[] = [
  {
    label: 'フォーム',
    icon: Form,
    to: '/forms',
    activePaths: ['/forms', '/forms/:formId', '/forms/:formId/:action'],
  },
]

export const sidebar = tv({
  slots: {
    container: [
      'flex',
      'flex-col',
      'w-64',
      'min-h-dvh',
      'border-r',
      'border-gray-100 dark:border-gray-700',
      'shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]',
    ],
    header: ['p-4'],
    logo: ['text-xl', 'font-bold'],
    nav: ['flex-1', 'p-2'],
    navItem: [
      'flex',
      'items-center',
      'gap-2',
      'px-3',
      'py-3',
      'rounded-md',
      'rounded-lg',
      'hover:bg-muted',
      'hover:text-foreground',
      'transition-colors',
    ],
    navItemActive: ['bg-neutral-50', 'dark:bg-neutral-800'],
    footer: ['p-2'],
    userTrigger: [
      'flex w-full',
      'items-center',
      'gap-2',
      'w-full',
      'px-3',
      'py-2',
      'rounded-lg',
      'text-sm',
      'transition-colors',
    ],
    userAvatar: [
      'w-8',
      'h-8',
      'rounded-full',
      'bg-muted',
      'flex',
      'items-center',
      'justify-center',
      'text-xs',
      'font-medium',
    ],
    userName: ['flex-1', 'truncate', 'text-left'],
  },
})
