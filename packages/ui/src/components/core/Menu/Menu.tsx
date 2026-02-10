import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../../../lib/utils'
import { menu } from './const'
import { useMenu } from './hooks/useMenu/useMenu'
import { MenuContext } from './context'
import type { MenuProps } from './type'

export const Menu = ({
  children,
  placement = 'bottom',
  align = 'start',
  offset = 4,
  disabled = false,
  open,
  onOpenChange,
  minWidth = 200,
  trigger,
  className,
  ...props
}: MenuProps) => {
  const { isOpen, menuId, handleToggle, handleClose, handleSelect, wrapperRef } = useMenu({
    disabled,
    open,
    onOpenChange,
  })

  const styles = menu({ placement, align })

  const getOffsetStyle = () => {
    if (offset == null) return undefined
    switch (placement) {
      case 'top':
        return { marginBottom: offset }
      case 'bottom':
        return { marginTop: offset }
      case 'left':
        return { marginRight: offset }
      case 'right':
        return { marginLeft: offset }
      default:
        return undefined
    }
  }

  return (
    <MenuContext.Provider value={{ handleClose, handleSelect }}>
      <div ref={wrapperRef} className={styles.wrapper()} {...props}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={isOpen ? menuId : undefined}
          onClick={handleToggle}
          disabled={disabled}
          style={{
            all: 'unset',
            cursor: disabled ? 'default' : 'pointer',
            display: 'inline-flex',
          }}
        >
          {trigger}
        </button>

        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              id={menuId}
              role="menu"
              aria-orientation="vertical"
              className={cn(styles.content(), className)}
              style={{ ...getOffsetStyle(), minWidth }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MenuContext.Provider>
  )
}
