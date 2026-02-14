import { tv } from 'tailwind-variants'

export const tabSchema = tv({
  slots: {
    container: ['space-y-6'],
    versionInfo: ['p-4', 'rounded-md'],
    fieldGroup: ['p-4', 'rounded-md'],
    fieldGroupTitle: ['mb-3'],
    definitionItem: ['py-2'],
    topicItem: ['py-1'],
    approveButton: ['mt-4'],
  },
})
