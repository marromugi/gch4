import { Tooltip } from '@ding/ui'
import { MoonFill, SunFill } from '@ding/ui/icon'
import { useTheme } from '@/lib/theme'
import { themeToggleButton } from './const'

export function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme()
  const styles = themeToggleButton()

  const label = isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'

  return (
    <Tooltip content={label} placement="bottom">
      <button type="button" onClick={toggleTheme} className={styles} aria-label={label}>
        {isDark ? <SunFill width={20} height={20} /> : <MoonFill width={20} height={20} />}
      </button>
    </Tooltip>
  )
}
