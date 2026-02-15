import { Icon, Typography } from '@ding/ui'
import { cn } from '@ding/ui/lib'
import { Link } from '@tanstack/react-router'
import { sidebar } from './const'
import type { SidebarNavItemProps } from './type'

export function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
  const styles = sidebar()
  const ItemIcon = item.icon

  return (
    <Link to={item.to} className={cn(styles.navItem(), isActive && styles.navItemActive())}>
      <Icon icon={ItemIcon} className="w-5 h-5" variant={'body'} />
      <Typography variant={isActive ? 'body' : 'description'} size={'sm'} weight={'semibold'}>
        {item.label}
      </Typography>
    </Link>
  )
}
