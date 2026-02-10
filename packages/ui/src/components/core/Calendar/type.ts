export interface CalendarMarker {
  /** 対象日付 */
  date: Date
  /** ドットの色（CSS色値） */
  color: string
}

export interface CalendarProps {
  /** 選択中の日付（controlled） */
  value?: Date
  /** デフォルト選択日付（uncontrolled） */
  defaultValue?: Date
  /** 日付選択時のコールバック */
  onChange?: (date: Date) => void
  /** ロケール（'ja', 'en' 等）@default 'en' */
  locale?: string
  /** 週の開始曜日（0=日曜, 1=月曜）@default 0 */
  weekStartsOn?: 0 | 1
  /** 日付の下に表示するカラードット */
  markers?: CalendarMarker[]
  /** カスタムクラス */
  className?: string
}
