import { tv } from 'tailwind-variants'

export const button = tv({
  base: '',
  variants: {
    variant: {
      primary: '',
      secondary: '',
      alert: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})
