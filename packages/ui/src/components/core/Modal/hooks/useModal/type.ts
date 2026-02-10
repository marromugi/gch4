import type { RefObject } from 'react'

export interface UseModalParams {
  /** 開閉状態 */
  open: boolean
  /** 開閉状態変更コールバック */
  onOpenChange: (open: boolean) => void
  /** オーバーレイクリックで閉じるか */
  closeOnOverlayClick: boolean
  /** Escapeキーで閉じるか */
  closeOnEscape: boolean
}

export interface UseModalReturn {
  /** ARIA 用のモーダル ID */
  modalId: string
  /** ARIA 用のタイトル ID */
  titleId: string
  /** モーダルを閉じる */
  handleClose: () => void
  /** オーバーレイクリックハンドラ */
  handleOverlayClick: (event: React.MouseEvent) => void
  /** コンテンツ要素の ref */
  contentRef: RefObject<HTMLDivElement | null>
}
