import { tv } from 'tailwind-variants'

export const fallbackForm = tv({
  slots: {
    container: 'flex flex-col gap-4 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30',
    warningText: 'text-amber-700 dark:text-amber-300',
    fieldList: 'flex flex-col gap-4',
    fieldItem: 'flex flex-col gap-1',
    fieldLabel: 'flex items-center gap-1',
    collectedBadge:
      'rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    actions: 'flex justify-end pt-4',
  },
})
