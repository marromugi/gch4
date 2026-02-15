import { tv } from 'tailwind-variants'

export const tabBasicInfo = tv({
  slots: {
    container: ['space-y-10'],
    statusRow: ['flex', 'gap-12', 'mb-10', 'px-1'],
    statusItem: ['space-y-1'],
    statusLabel: ['text-sm', 'text-gray-500', 'font-medium', 'block'],
    statusBadge: [
      'inline-flex',
      'items-center',
      'px-3',
      'py-1',
      'rounded-full',
      'text-sm',
      'font-medium',
    ],
    infoCard: ['bg-white dark:bg-neutral-900', 'p-4', 'rounded-xl', 'space-y-6'],
    fieldGroup: ['space-y-1', 'flex flex-col'],
    fieldLabel: [],
    fieldValue: [],
    editForm: ['space-y-6'],
    actions: ['flex', 'gap-2', 'pt-4'],
  },
})
