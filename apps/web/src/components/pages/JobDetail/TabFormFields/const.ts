import { tv } from 'tailwind-variants'

export const tabFormFields = tv({
  slots: {
    container: ['space-y-4'],
    editForm: ['space-y-4'],
    fieldItem: ['p-4', 'rounded-md'],
    fieldActions: ['flex', 'gap-2', 'pt-4'],
    addButton: ['mt-4'],
  },
})
