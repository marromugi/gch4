import type { ScheduleEvent, EventLayout, TimeToPositionConfig, ScheduleTimeStep } from './type'
import { HOUR_HEIGHT_PX } from './const'

/**
 * 時間を「HH:MM」形式の文字列に変換
 */
export function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/**
 * 時間を「H時」形式の文字列に変換（時間線表示用）
 */
export function formatHourLabel(hour: number): string {
  return `${Math.floor(hour)}時`
}

/**
 * 時間からY座標（px）を計算
 */
export function hourToPosition(hour: number, config: TimeToPositionConfig): number {
  const { startHour, endHour, containerHeight } = config
  const totalHours = endHour - startHour
  const relativeHour = hour - startHour
  return (relativeHour / totalHours) * containerHeight
}

/**
 * Y座標（px）から時間を計算
 */
export function positionToHour(position: number, config: TimeToPositionConfig): number {
  const { startHour, endHour, containerHeight } = config
  const totalHours = endHour - startHour
  const hour = startHour + (position / containerHeight) * totalHours
  return Math.max(startHour, Math.min(endHour, hour))
}

/**
 * 時間をtimeStepにスナップ
 */
export function snapToTimeStep(hour: number, timeStep: ScheduleTimeStep): number {
  const stepInHours = timeStep / 60
  return Math.round(hour / stepInHours) * stepInHours
}

/**
 * 2つのイベントが時間的に重なっているかチェック
 */
export function eventsOverlap(a: ScheduleEvent, b: ScheduleEvent): boolean {
  // 完全に前後に分かれている場合はfalse
  if (a.endHour <= b.startHour || b.endHour <= a.startHour) {
    return false
  }
  return true
}

/**
 * 重複するイベントをグループ化
 */
export function groupOverlappingEvents(events: ScheduleEvent[]): ScheduleEvent[][] {
  if (events.length === 0) return []

  // 開始時間でソート
  const sorted = [...events].sort((a, b) => a.startHour - b.startHour)
  const groups: ScheduleEvent[][] = []
  let currentGroup: ScheduleEvent[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const event = sorted[i]
    // 現在のグループ内のどれかのイベントと重なっているかチェック
    const overlapsWithGroup = currentGroup.some((e) => eventsOverlap(e, event))

    if (overlapsWithGroup) {
      currentGroup.push(event)
    } else {
      groups.push(currentGroup)
      currentGroup = [event]
    }
  }

  groups.push(currentGroup)
  return groups
}

/**
 * グループ内でイベントにカラム位置を割り当て
 */
function assignColumnsToGroup(events: ScheduleEvent[]): Map<string, number> {
  const columns = new Map<string, number>()
  const columnEndTimes: number[] = []

  // 開始時間でソート
  const sorted = [...events].sort((a, b) => a.startHour - b.startHour)

  for (const event of sorted) {
    // 使用可能な最初のカラムを探す
    let assignedColumn = -1
    for (let col = 0; col < columnEndTimes.length; col++) {
      if (columnEndTimes[col] <= event.startHour) {
        assignedColumn = col
        break
      }
    }

    if (assignedColumn === -1) {
      // 新しいカラムを追加
      assignedColumn = columnEndTimes.length
      columnEndTimes.push(event.endHour)
    } else {
      columnEndTimes[assignedColumn] = event.endHour
    }

    columns.set(event.id, assignedColumn)
  }

  return columns
}

/**
 * イベントのレイアウト情報を計算（重複を考慮）
 * 重複イベントは横並び均等分割ではなく、重ね表示される
 * - column 0: 左配置、基本幅80%
 * - column 1以降: 右配置、基本幅40%、右寄せ
 * - 縮小係数: 1 / Math.sqrt(totalColumns)
 */
export function calculateEventLayout(
  events: ScheduleEvent[],
  config: TimeToPositionConfig
): Map<string, EventLayout> {
  const layouts = new Map<string, EventLayout>()
  const groups = groupOverlappingEvents(events)

  for (const group of groups) {
    const columns = assignColumnsToGroup(group)
    const totalColumns = Math.max(...Array.from(columns.values())) + 1

    for (const event of group) {
      const column = columns.get(event.id) ?? 0

      // 縮小係数をsqrtで計算
      const shrinkRatio = 1 / Math.sqrt(totalColumns)
      let width: number
      let left: number

      if (totalColumns === 1) {
        // 重複なし：フル幅
        width = 1
        left = 0
      } else if (column === 0) {
        // 最初のイベント：左配置、基本幅80%を縮小
        width = 0.8 * shrinkRatio
        left = 0
      } else {
        // 後のイベント：前のイベントの右80%位置に配置
        width = 0.4 * shrinkRatio
        left = 0.8
      }

      // z-indexは後のイベントほど高く（上に重なる）
      const zIndex = 10 + column

      const top = hourToPosition(event.startHour, config)
      const bottom = hourToPosition(event.endHour, config)
      const height = bottom - top

      layouts.set(event.id, {
        left,
        width,
        top,
        height,
        column,
        totalColumns,
        zIndex,
      })
    }
  }

  return layouts
}

/**
 * 現在時刻を小数時間で取得
 */
export function getCurrentHour(): number {
  const now = new Date()
  return now.getHours() + now.getMinutes() / 60
}

/**
 * コンテナの高さを計算
 */
export function calculateContainerHeight(startHour: number, endHour: number): number {
  return (endHour - startHour) * HOUR_HEIGHT_PX
}

/**
 * イベントの色からテキスト色を決定（コントラスト考慮）
 */
export function getTextColorForBackground(bgColor: string): string {
  // 簡易的な輝度計算
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#1f2937' : '#ffffff'
}

/**
 * イベントの色から背景色とボーダー色を生成
 */
export function getEventColors(baseColor: string): {
  background: string
  border: string
  text: string
} {
  return {
    background: `${baseColor}20`, // 12.5% opacity
    border: baseColor,
    text: baseColor,
  }
}
