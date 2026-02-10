import type { RefObject } from 'react'

export interface UseMenuParams {
  /** メニューを無効にするか */
  disabled: boolean
  /** 制御モード：外部からの開閉状態 */
  open?: boolean
  /** 制御モード：開閉状態変更コールバック */
  onOpenChange?: (open: boolean) => void
}

export interface UseMenuReturn {
  /** メニューが表示中か */
  isOpen: boolean
  /** ARIA 用の一意な ID */
  menuId: string
  /** トリガーのクリックハンドラ */
  handleToggle: () => void
  /** メニューを閉じる */
  handleClose: () => void
  /** アイテム選択ハンドラ（コールバック実行後にメニューを閉じる） */
  handleSelect: (callback?: () => void) => () => void
  /** ラッパー要素の ref（外部クリック検知に使用） */
  wrapperRef: RefObject<HTMLDivElement | null>
}
