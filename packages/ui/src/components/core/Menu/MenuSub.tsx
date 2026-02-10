import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../../../lib/utils'
import { menuSub, menuItemIconSize } from './const'
import { ChevronRight } from '../../icon'
import type { MenuSubProps } from './type'

export const MenuSub = ({
  label,
  icon: IconComponent,
  children,
  disabled = false,
  className,
  ...props
}: MenuSubProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const styles = menuSub({ disabled })

  const handleMouseEnter = useCallback(() => {
    if (disabled) return
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }, [disabled])

  const handleMouseLeave = useCallback(() => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }, [disabled])

  const handleClick = useCallback(() => {
    if (disabled) return
    setIsOpen((prev) => !prev)
  }, [disabled])

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        tabIndex={-1}
        disabled={disabled}
        className={cn(styles.trigger(), className)}
        onClick={handleClick}
      >
        {IconComponent && (
          <IconComponent className={cn(menuItemIconSize, 'shrink-0')} aria-hidden="true" />
        )}
        <span className="flex-1 truncate">{label}</span>
        <ChevronRight className={cn(menuItemIconSize, 'shrink-0')} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            role="menu"
            aria-orientation="vertical"
            className={styles.content()}
            style={{ minWidth: 180 }}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
