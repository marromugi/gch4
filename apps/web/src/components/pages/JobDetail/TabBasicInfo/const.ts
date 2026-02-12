import { tv } from 'tailwind-variants'

export const tabBasicInfo = tv({
  slots: {
    container: ['space-y-6'],
    fieldGroup: ['space-y-1'],
    fieldLabel: [],
    fieldValue: [],
    editForm: ['space-y-6'],
    actions: ['flex', 'gap-2', 'pt-4'],
  },
})
