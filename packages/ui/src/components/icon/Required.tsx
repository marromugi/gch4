import type { SVGProps } from 'react'

/**
 * Requiredアイコン
 */
export const Required = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg height="22" viewBox="0 0 22 22" width="22" fill="none" aria-label="Required" {...props}>
      <title>Required</title>
      <path
        d="M4.14844 8.72247L11.1484 13.2225M11.1484 13.2225V4.22247M11.1484 13.2225L17.6484 8.72247M11.1484 13.2225L15.6484 18.2225M11.1484 13.2225L6.64844 18.7225"
        stroke="#FF2F2F"
        stroke-width="4"
        stroke-linecap="round"
      />
    </svg>
  )
}
