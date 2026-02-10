import type { SVGProps } from 'react'

/**
 * Placeholderアイコン
 */
export const Placeholder = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg height="84" viewBox="0 0 84 84" width="84" fill="none" aria-label="Placeholder" {...props}>
      <title>Placeholder</title>
      <path
        d="M12 50.7041C12 50.7041 26.0607 35.3036 36.0816 38.4151C42.5756 40.4316 42.3684 48.9289 48.9252 50.7041C58.3654 53.2601 71 38.4151 71 38.4151"
        stroke="currentColor"
        stroke-width="12"
        stroke-linecap="round"
      />
    </svg>
  )
}
