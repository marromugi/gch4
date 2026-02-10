import type { HTMLAttributes, ReactNode } from 'react'
import type { schedule } from './const'
import type { VariantProps } from 'tailwind-variants'

/**
 * スケジュールに表示するイベントデータ
 */
export interface ScheduleEvent {
  /** イベントの一意識別子 */
  id: string
  /** イベントのタイトル */
  title: string
  /** 開始時間（0-24の小数点、例: 9.5 = 9:30） */
  startHour: number
  /** 終了時間（0-24の小数点、例: 17.5 = 17:30） */
  endHour: number
  /** イベントの色（CSS色値） */
  color?: string
}

/**
 * イベント時間変更のコールバック引数
 */
export interface ScheduleEventTimeChange {
  /** 変更されたイベントのID */
  eventId: string
  /** 新しい開始時間 */
  newStartHour: number
  /** 新しい終了時間 */
  newEndHour: number
}

/**
 * 時間の刻み幅（分単位）
 */
export type ScheduleTimeStep = 15 | 30 | 60

/**
 * メインScheduleコンポーネントのProps
 */
export interface ScheduleProps
  extends VariantProps<typeof schedule>, Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 表示するイベント配列 */
  events: ScheduleEvent[]
  /** イベント時間変更時のコールバック */
  onEventTimeChange?: (change: ScheduleEventTimeChange) => void
  /** イベントクリック時のコールバック */
  onEventClick?: (event: ScheduleEvent) => void
  /** 空き時間クリック時のコールバック（新規作成用） */
  onEmptyClick?: (hour: number) => void
  /** 表示開始時間（デフォルト: 0） */
  startHour?: number
  /** 表示終了時間（デフォルト: 24） */
  endHour?: number
  /** 時間の刻み幅（分）、デフォルト: 30 */
  timeStep?: ScheduleTimeStep
  /** ドラッグ可能かどうか（デフォルト: true） */
  draggable?: boolean
  /** コンポーネントの高さ（デフォルト: '600px'） */
  height?: string | number
  /** 読み取り専用モード */
  readOnly?: boolean
  /** 追加のクラス名 */
  className?: string
  /** 子要素 */
  children?: ReactNode
}

/**
 * 時間線コンポーネントのProps
 */
export interface ScheduleTimeLineProps {
  /** 表示開始時間 */
  startHour: number
  /** 表示終了時間 */
  endHour: number
  /** 現在時刻を表示するか */
  showCurrentTime?: boolean
  /** 追加のクラス名 */
  className?: string
}

/**
 * イベントコンポーネントのProps
 */
export interface ScheduleEventItemProps {
  /** イベントデータ */
  event: ScheduleEvent
  /** 計算済みのレイアウト情報 */
  layout: EventLayout
  /** 表示開始時間 */
  startHour: number
  /** 表示終了時間 */
  endHour: number
  /** クリック時のコールバック */
  onClick?: () => void
  /** ドラッグ可能かどうか */
  draggable?: boolean
  /** 読み取り専用モード */
  readOnly?: boolean
  /** ドラッグ開始時のコールバック */
  onDragStart?: (type: DragType, event: ScheduleEvent) => void
  /** ドラッグ中のコールバック */
  onDrag?: (deltaY: number) => void
  /** ドラッグ終了時のコールバック */
  onDragEnd?: () => void
  /** プレビュー用の時間（ドラッグ中） */
  previewStartHour?: number
  previewEndHour?: number
  /** ドラッグ中かどうか */
  isDragging?: boolean
}

/**
 * ドラッグ操作の種類
 */
export type DragType = 'move' | 'resizeTop' | 'resizeBottom'

/**
 * ドラッグ状態
 */
export interface DragState {
  /** ドラッグ中かどうか */
  isDragging: boolean
  /** ドラッグ対象のイベントID */
  eventId: string | null
  /** ドラッグの種類 */
  dragType: DragType | null
  /** ドラッグ開始時のY座標 */
  startY: number
  /** プレビュー用の開始時間 */
  previewStartHour: number
  /** プレビュー用の終了時間 */
  previewEndHour: number
  /** 元の開始時間 */
  originalStartHour: number
  /** 元の終了時間 */
  originalEndHour: number
}

/**
 * useScheduleDragフックのオプション
 */
export interface UseScheduleDragOptions {
  /** 時間の刻み幅（分） */
  timeStep: ScheduleTimeStep
  /** 表示開始時間 */
  startHour: number
  /** 表示終了時間 */
  endHour: number
  /** コンテナの高さ（px） */
  containerHeight: number
  /** 時間変更時のコールバック */
  onTimeChange?: (change: ScheduleEventTimeChange) => void
}

/**
 * useScheduleDragフックの戻り値
 */
export interface UseScheduleDragReturn {
  /** ドラッグ状態 */
  dragState: DragState
  /** ドラッグ開始ハンドラ */
  handleDragStart: (type: DragType, event: ScheduleEvent, clientY: number) => void
  /** ドラッグ中ハンドラ */
  handleDrag: (clientY: number) => void
  /** ドラッグ終了ハンドラ */
  handleDragEnd: () => void
}

/**
 * イベントレイアウト情報（重複計算後）
 */
export interface EventLayout {
  /** 左端からの位置（0-1の割合） */
  left: number
  /** 幅（0-1の割合） */
  width: number
  /** 上からの位置（px） */
  top: number
  /** 高さ（px） */
  height: number
  /** 所属するカラムインデックス */
  column: number
  /** グループ内の総カラム数 */
  totalColumns: number
  /** 重なり順序（後のイベントほど高い値） */
  zIndex: number
}

/**
 * 時間からピクセル位置への変換に必要な情報
 */
export interface TimeToPositionConfig {
  /** 表示開始時間 */
  startHour: number
  /** 表示終了時間 */
  endHour: number
  /** コンテナの高さ（px） */
  containerHeight: number
}
