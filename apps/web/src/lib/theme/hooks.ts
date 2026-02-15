import { useThemeContext } from './context'

/**
 * テーマに関するメインフック
 */
export function useTheme() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeContext()

  return {
    /** 設定されているテーマ */
    theme,
    /** 実際に適用されているテーマ */
    resolvedTheme,
    /** ダークモードかどうか */
    isDark: resolvedTheme === 'dark',
    /** ライトモードかどうか */
    isLight: resolvedTheme === 'light',
    /** テーマを設定 */
    setTheme,
    /** ダーク/ライトをトグル */
    toggleTheme,
  }
}
