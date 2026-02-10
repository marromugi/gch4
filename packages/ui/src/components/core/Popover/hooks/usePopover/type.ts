import type { RefObject } from 'react'

export interface UsePopoverParams {
  /** ポップオーバーを無効にするか */
  disabled: boolean
  /** 制御モード：外部からの開閉状態 */
  open?: boolean
  /** 制御モード：開閉状態変更コールバック */
  onOpenChange?: (open: boolean) => void
}

export interface UsePopoverReturn {
  /** ポップオーバーが表示中か */
  isOpen: boolean
  /** ARIA 用の一意な ID */
  popoverId: string
  /** トリガーのクリックハンドラ */
  handleToggle: () => void
  /** ポップオーバーを閉じる */
  handleClose: () => void
  /** ラッパー要素の ref（外部クリック検知に使用） */
  wrapperRef: RefObject<HTMLDivElement | null>
}
