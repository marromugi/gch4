import { Box, Icon, Menu, MenuDivider, MenuItem, Typography } from '@ding/ui'
import { Ding, MoonFill, SunFill } from '@ding/ui/icon'
import { cn } from '@ding/ui/lib'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { sidebar, navItems } from './const'
import { useSidebarNavigation } from './hooks'
import { SidebarNavItem } from './SidebarNavItem'
import type { SidebarProps } from './type'

export function Sidebar({ className }: SidebarProps) {
  const styles = sidebar()
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { isPathActive } = useSidebarNavigation()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Box as={'aside'} background={'surface'} className={cn(styles.container(), className)}>
      <div className={styles.header()}>
        <Icon icon={Ding} size={'xl'} variant={'body'} />
      </div>

      <nav className={styles.nav()}>
        {navItems.map((item) => (
          <SidebarNavItem key={item.to} item={item} isActive={isPathActive(item.activePaths)} />
        ))}
      </nav>

      <div className={styles.footer()}>
        <Menu
          trigger={
            <Box background={'muted'} className={styles.userTrigger()}>
              <div className={styles.userAvatar()}>
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user?.name ?? 'U')
                )}
              </div>
              <Typography size={'sm'} className={styles.userName()}>
                {user?.name ?? 'ユーザー'}
              </Typography>
            </Box>
          }
          placement="top"
          align="start"
          className="w-full"
        >
          <MenuItem icon={isDark ? SunFill : MoonFill} onClick={toggleTheme}>
            {isDark ? 'ライトモード' : 'ダークモード'}
          </MenuItem>
          <MenuDivider />
          <MenuItem onClick={signOut} destructive>
            ログアウト
          </MenuItem>
        </Menu>
      </div>
    </Box>
  )
}
