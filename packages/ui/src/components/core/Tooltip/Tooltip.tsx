import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../../../lib/utils'
import { tooltip } from './const'
import { useTooltip } from './hooks/useTooltip/useTooltip'
import { getMotionProps } from './utils'
import type { TooltipProps } from './type'

export const Tooltip = ({
  content,
  placement = 'top',
  align = 'center',
  delay = 0,
  arrow: showArrow = false,
  offset,
  disabled = false,
  className,
  children,
  ...props
}: TooltipProps) => {
  const { isOpen, tooltipId, handleOpen, handleClose } = useTooltip({ delay, disabled })
  const styles = tooltip({ placement, align })
  const motionProps = getMotionProps(placement)

  const offsetStyle =
    offset != null
      ? {
          top: { marginBottom: offset },
          bottom: { marginTop: offset },
          left: { marginRight: offset },
          right: { marginLeft: offset },
        }[placement]
      : undefined

  return (
    <div
      className={styles.wrapper()}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
      {...props}
    >
      <span aria-describedby={isOpen ? tooltipId : undefined}>{children}</span>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            className={cn(styles.content(), className)}
            style={offsetStyle}
            {...motionProps}
          >
            {content}
            {showArrow && <span className={styles.arrow()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
