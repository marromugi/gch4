import type { SVGProps } from 'react'

/**
 * Chevron Rightアイコン
 */
export const ChevronRight = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
      aria-label="Chevron Right"
      {...props}
    >
      <title>Chevron Right</title>
      <path d="m528-480-156 156q-11 11-11 28t11 28q11 11 28 11t28-11l184-184q6-6 8.5-13t2.5-15q0-8-2.5-15t-8.5-13l-184-184q-11-11-28-11t-28 11q-11 11-11 28t11 28l156 156Z"/>
    </svg>
  )
}
