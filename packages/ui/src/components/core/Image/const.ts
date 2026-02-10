import { tv } from 'tailwind-variants'

export const image = tv({
  base: ['transition-all', 'duration-500', 'ease-in-out'],
  variants: {
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    },
    objectFit: {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
    },
  },
  defaultVariants: {
    radius: 'none',
    objectFit: 'cover',
  },
})
