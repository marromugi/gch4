export interface UseRadioGroupParams {
  /** 制御モード：外部からの選択値 */
  value?: string
  /** 非制御モード：初期値 */
  defaultValue?: string
  /** 値変更コールバック */
  onValueChange?: (value: string) => void
  /** 無効状態 */
  disabled: boolean
}

export interface UseRadioGroupReturn {
  /** 現在の選択値 */
  currentValue: string | undefined
  /** 値を設定する */
  setValue: (value: string) => void
  /** ARIA 用の一意な ID（name 属性として使用） */
  groupId: string
}
