import { tv } from 'tailwind-variants'

export const designChat = tv({
  slots: {
    container: ['flex', 'flex-col', 'h-full', 'bg-neutral-50', 'dark:bg-neutral-900'],
    content: ['flex-1', 'overflow-y-auto', 'p-6', 'space-y-6'],
    footer: [
      'p-4',
      'border-t',
      'border-neutral-200',
      'dark:border-neutral-700',
      'bg-white',
      'dark:bg-neutral-800',
    ],
    loadingContainer: ['flex', 'items-center', 'justify-center', 'py-8'],
    loadingSpinner: [
      'w-8',
      'h-8',
      'border-4',
      'border-neutral-200',
      'dark:border-neutral-600',
      'border-t-neutral-600',
      'dark:border-t-neutral-300',
      'rounded-full',
      'animate-spin',
    ],
    loadingText: ['ml-3', 'text-sm', 'text-neutral-600', 'dark:text-neutral-400'],
  },
})

export const questionCard = tv({
  slots: {
    container: [
      'bg-white',
      'dark:bg-neutral-800',
      'rounded-2xl',
      'shadow-sm',
      'border',
      'border-neutral-200',
      'dark:border-neutral-700',
      'p-6',
      'transition-all',
      'duration-300',
    ],
    question: ['text-lg', 'font-medium', 'text-neutral-900', 'dark:text-neutral-50', 'mb-4'],
    optionsContainer: ['space-y-3'],
    selectionHint: ['text-xs', 'text-neutral-500', 'dark:text-neutral-400', 'mt-4'],
    freeTextContainer: [
      'mt-4',
      'pt-4',
      'border-t',
      'border-neutral-100',
      'dark:border-neutral-700',
    ],
    freeTextInput: [
      'w-full',
      'px-4',
      'py-3',
      'text-sm',
      'rounded-xl',
      'border',
      'border-neutral-200',
      'dark:border-neutral-600',
      'bg-neutral-50',
      'dark:bg-neutral-700/50',
      'text-neutral-900',
      'dark:text-neutral-100',
      'placeholder:text-neutral-400',
      'dark:placeholder:text-neutral-500',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500/20',
      'focus:border-blue-500',
      'dark:focus:border-blue-400',
      'resize-none',
      'transition-all',
      'duration-200',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
    ],
  },
})

export const optionButton = tv({
  slots: {
    button: [
      'w-full',
      'flex',
      'items-center',
      'gap-3',
      'px-4',
      'py-3',
      'rounded-xl',
      'border-2',
      'transition-all',
      'duration-200',
      'cursor-pointer',
      'text-left',
    ],
    indicator: [
      'flex-shrink-0',
      'w-5',
      'h-5',
      'border-2',
      'flex',
      'items-center',
      'justify-center',
      'transition-all',
      'duration-200',
    ],
    indicatorInner: ['w-2.5', 'h-2.5', 'transition-all', 'duration-200'],
    label: ['flex-1', 'text-sm', 'font-medium'],
  },
  variants: {
    selected: {
      true: {
        button: ['border-blue-500', 'bg-blue-50', 'dark:border-blue-400', 'dark:bg-blue-900/20'],
        indicator: ['border-blue-500', 'dark:border-blue-400'],
        indicatorInner: ['bg-blue-500', 'dark:bg-blue-400'],
        label: ['text-blue-700', 'dark:text-blue-300'],
      },
      false: {
        button: [
          'border-neutral-200',
          'dark:border-neutral-600',
          'bg-neutral-50',
          'dark:bg-neutral-700/50',
          'hover:border-neutral-300',
          'dark:hover:border-neutral-500',
          'hover:bg-neutral-100',
          'dark:hover:bg-neutral-700',
        ],
        indicator: ['border-neutral-300', 'dark:border-neutral-500'],
        indicatorInner: ['bg-transparent'],
        label: ['text-neutral-700', 'dark:text-neutral-300'],
      },
    },
    selectionType: {
      radio: {
        indicator: ['rounded-full'],
        indicatorInner: ['rounded-full'],
      },
      checkbox: {
        indicator: ['rounded'],
        indicatorInner: ['rounded-sm'],
      },
    },
    disabled: {
      true: {
        button: ['opacity-50', 'cursor-not-allowed', 'pointer-events-none'],
      },
    },
  },
  defaultVariants: {
    selected: false,
    selectionType: 'radio',
    disabled: false,
  },
})

export const footerButton = tv({
  base: [
    'w-full',
    'py-3',
    'px-6',
    'rounded-xl',
    'font-semibold',
    'text-sm',
    'transition-all',
    'duration-200',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ],
  variants: {
    variant: {
      primary: [
        'bg-neutral-900',
        'text-white',
        'hover:bg-neutral-800',
        'dark:bg-neutral-50',
        'dark:text-neutral-900',
        'dark:hover:bg-neutral-200',
      ],
      secondary: [
        'bg-neutral-100',
        'text-neutral-700',
        'hover:bg-neutral-200',
        'dark:bg-neutral-700',
        'dark:text-neutral-200',
        'dark:hover:bg-neutral-600',
      ],
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

export const completeMessage = tv({
  slots: {
    container: ['text-center', 'py-8'],
    icon: ['text-4xl', 'mb-4'],
    title: ['text-lg', 'font-semibold', 'text-neutral-900', 'dark:text-neutral-50', 'mb-2'],
    description: ['text-sm', 'text-neutral-600', 'dark:text-neutral-400'],
  },
})
