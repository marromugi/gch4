export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** 設定されているテーマ */
  theme: Theme
  /** 実際に適用されているテーマ（systemの場合は解決後の値） */
  resolvedTheme: ResolvedTheme
  /** テーマを設定 */
  setTheme: (theme: Theme) => void
  /** ダーク/ライトをトグル */
  toggleTheme: () => void
}
