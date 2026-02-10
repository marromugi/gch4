import { forwardRef, useContext } from 'react'
import { cn } from '../../../lib/utils'
import { menuItem, menuItemIconSize, menuShortcut } from './const'
import { MenuContext } from './context'
import type { MenuItemProps } from './type'

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  (
    {
      children,
      icon: IconComponent,
      endIcon: EndIconComponent,
      onClick,
      disabled = false,
      destructive = false,
      shortcut,
      className,
      ...props
    },
    ref
  ) => {
    const context = useContext(MenuContext)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (onClick) {
        context?.handleSelect(() => onClick(event))()
      } else {
        context?.handleClose()
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        tabIndex={-1}
        disabled={disabled}
        className={cn(menuItem({ destructive, disabled }), className)}
        onClick={handleClick}
        {...props}
      >
        {IconComponent && (
          <IconComponent className={cn(menuItemIconSize, 'shrink-0')} aria-hidden="true" />
        )}
        <span className="flex-1 truncate">{children}</span>
        {shortcut && <span className={menuShortcut()}>{shortcut}</span>}
        {EndIconComponent && (
          <EndIconComponent className={cn(menuItemIconSize, 'shrink-0')} aria-hidden="true" />
        )}
      </button>
    )
  }
)

MenuItem.displayName = 'MenuItem'
