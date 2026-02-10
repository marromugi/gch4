/** Enter キーの動作モード */
export type EnterActionMode = 'submit' | 'newline'

export interface UseEnterActionParams {
  /** 現在のモード */
  mode: EnterActionMode
  /** submit 時に呼ばれるコールバック */
  onSubmit: () => void
  /** モード切替時のコールバック */
  onModeChange?: (mode: EnterActionMode) => void
}

export interface UseEnterActionReturn {
  /** 現在のモード */
  mode: EnterActionMode
  /** IME 変換中かどうか */
  isComposing: boolean
  /** モードをトグルする */
  toggleMode: () => void
  /** textarea / input / contenteditable に付与するイベントハンドラ群 */
  handlers: {
    onKeyDown: (e: React.KeyboardEvent) => void
    onCompositionStart: () => void
    onCompositionEnd: () => void
  }
}
