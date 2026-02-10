import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../../../lib/utils'
import { popover } from './const'
import { usePopover } from './hooks/usePopover/usePopover'
import { getMotionProps } from './utils'
import type { PopoverProps } from './type'

export const Popover = ({
  content,
  placement = 'bottom',
  align = 'center',
  arrow: showArrow = false,
  offset,
  disabled = false,
  open,
  onOpenChange,
  className,
  children,
  ...props
}: PopoverProps) => {
  const { isOpen, popoverId, handleToggle, wrapperRef } = usePopover({
    disabled,
    open,
    onOpenChange,
  })
  const styles = popover({ placement, align })
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
    <div ref={wrapperRef} className={styles.wrapper()} {...props}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isOpen ? popoverId : undefined}
        onClick={handleToggle}
        disabled={disabled}
        style={{
          all: 'unset',
          cursor: disabled ? 'default' : 'pointer',
          display: 'inline-flex',
        }}
      >
        {children}
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            id={popoverId}
            role="dialog"
            aria-modal="false"
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
