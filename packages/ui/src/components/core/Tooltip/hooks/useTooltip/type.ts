export interface UseTooltipParams {
  /** ホバーから表示までの遅延（ms） */
  delay: number
  /** ツールチップを無効にするか */
  disabled: boolean
}

export interface UseTooltipReturn {
  /** ツールチップが表示中か */
  isOpen: boolean
  /** ARIA 用の一意な ID */
  tooltipId: string
  /** ツールチップを開く */
  handleOpen: () => void
  /** ツールチップを閉じる */
  handleClose: () => void
}
