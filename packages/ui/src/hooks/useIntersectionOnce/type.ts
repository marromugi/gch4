export type UseIntersectionOnceParams = {
  /** 交差を検知した時に呼ばれるコールバック */
  onIntersect: () => void
  /** IntersectionObserver の threshold (default: 0.1) */
  threshold?: number
  /** IntersectionObserver の rootMargin */
  rootMargin?: string
  /** フックを無効にする（loading中など） */
  disabled?: boolean
}

export type UseIntersectionOnceReturn = {
  /** 監視対象要素に設定するref */
  ref: React.RefObject<HTMLDivElement | null>
  /** トリガー済みかどうか */
  hasTriggered: boolean
  /** フラグをリセットして再度検知可能にする */
  reset: () => void
}
