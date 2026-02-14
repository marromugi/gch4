import { tv } from 'tailwind-variants'

export const previewFormDataModal = tv({
  slots: {
    dataList: ['space-y-6'],
    dataItem: ['flex', 'flex-col', 'gap-1'],
    label: ['text-xs', 'font-medium', 'text-gray-500'],
    value: ['text-sm', 'text-gray-900'],
    buttonContainer: ['mt-6'],
  },
})
