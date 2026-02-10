import type { SVGProps } from 'react'

/**
 * Movie Fillアイコン
 */
export const MovieFill = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
      aria-label="Movie Fill"
      {...props}
    >
      <title>Movie Fill</title>
      <path d="m162.87-808.13 65 130q7 14 20 22t28 8q30 0 46-25.5t2-52.5l-41-82h80l65 130q7 14 20 22t28 8q30 0 46-25.5t2-52.5l-41-82h80l65 130q7 14 20 22t28 8q30 0 46-25.5t2-52.5l-41-82h114.26q37.78 0 64.39 26.61t26.61 64.39v474.26q0 37.78-26.61 64.39t-64.39 26.61H162.87q-37.78 0-64.39-26.37t-26.61-63.91v-474.98q0-37.78 26.61-64.39t64.39-26.61Z" />
    </svg>
  )
}
