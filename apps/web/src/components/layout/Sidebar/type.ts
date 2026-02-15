import type { ComponentType, SVGProps } from 'react'

export interface SidebarProps {
  className?: string
}

export interface NavItemConfig {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  to: string
  activePaths: string[]
}

export interface SidebarNavItemProps {
  item: NavItemConfig
  isActive: boolean
}
