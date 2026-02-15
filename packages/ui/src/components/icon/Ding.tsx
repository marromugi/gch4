import type { SVGProps } from 'react'

/**
 * Dingアイコン
 */
export const Ding = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg height="173" viewBox="0 0 173 173" width="173" fill="none" aria-label="Ding" {...props}>
      <title>Ding</title>
      <path
        d="M57 74.7041C57 74.7041 71.0607 59.3036 81.0816 62.4151C87.5756 64.4316 87.3684 72.9289 93.9252 74.7041C103.365 77.2601 116 62.4151 116 62.4151"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
      />
      <path
        d="M57 110.704C57 110.704 71.0607 95.3036 81.0816 98.4151C87.5756 100.432 87.3684 108.929 93.9252 110.704C103.365 113.26 116 98.4151 116 98.4151"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
      />
      <rect
        x="36"
        y="21"
        width="102"
        height="131"
        rx="24"
        stroke="currentColor"
        stroke-width="16"
      />
    </svg>
  )
}
