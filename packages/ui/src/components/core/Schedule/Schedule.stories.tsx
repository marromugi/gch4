import type { Meta, StoryObj } from '@storybook/react'
import { useState, useCallback } from 'react'
import { Schedule } from './Schedule'
import type { ScheduleEvent, ScheduleEventTimeChange } from './type'
import { formatHour } from './utils'

const meta: Meta<typeof Schedule> = {
  title: 'Components/Schedule',
  component: Schedule,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '縦型スケジュールコンポーネント。0時から24時までの時間線を表示し、イベントをドラッグで移動・リサイズできます。',
      },
    },
  },
  argTypes: {
    startHour: {
      control: { type: 'number', min: 0, max: 23 },
      description: '表示開始時間',
    },
    endHour: {
      control: { type: 'number', min: 1, max: 24 },
      description: '表示終了時間',
    },
    timeStep: {
      control: 'select',
      options: [15, 30, 60],
      description: '時間の刻み幅（分）',
    },
    draggable: {
      control: 'boolean',
      description: 'ドラッグ可能かどうか',
    },
    readOnly: {
      control: 'boolean',
      description: '読み取り専用モード',
    },
    height: {
      control: 'text',
      description: 'コンポーネントの高さ',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Schedule>

// サンプルイベントデータ
const sampleEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: '朝のミーティング',
    startHour: 9,
    endHour: 10,
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'ランチ',
    startHour: 12,
    endHour: 13,
    color: '#10b981',
  },
  {
    id: '3',
    title: 'プロジェクト作業',
    startHour: 14,
    endHour: 17,
    color: '#f59e0b',
  },
  {
    id: '4',
    title: '1on1ミーティング',
    startHour: 10.5,
    endHour: 11.5,
    color: '#8b5cf6',
  },
]

// 重複イベントのサンプル
const overlappingEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'チームミーティング',
    startHour: 10,
    endHour: 11.5,
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'プロジェクトA',
    startHour: 10.5,
    endHour: 12,
    color: '#10b981',
  },
  {
    id: '3',
    title: 'プロジェクトB',
    startHour: 11,
    endHour: 13,
    color: '#f59e0b',
  },
  {
    id: '4',
    title: '午後の作業',
    startHour: 14,
    endHour: 16,
    color: '#8b5cf6',
  },
]

/**
 * 基本的な使い方
 */
export const Default: Story = {
  args: {
    events: sampleEvents,
    height: '600px',
    startHour: 8,
    endHour: 18,
    timeStep: 30,
  },
  render: function Render(args) {
    const [events, setEvents] = useState(args.events)

    const handleTimeChange = useCallback((change: ScheduleEventTimeChange) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === change.eventId
            ? { ...e, startHour: change.newStartHour, endHour: change.newEndHour }
            : e
        )
      )
      console.log(
        `イベント ${change.eventId} の時間を ${formatHour(change.newStartHour)} - ${formatHour(change.newEndHour)} に変更`
      )
    }, [])

    const handleEventClick = useCallback((event: ScheduleEvent) => {
      console.log('イベントクリック:', event.title)
    }, [])

    const handleEmptyClick = useCallback((hour: number) => {
      console.log('空き時間クリック:', formatHour(hour))
    }, [])

    return (
      <Schedule
        {...args}
        events={events}
        onEventTimeChange={handleTimeChange}
        onEventClick={handleEventClick}
        onEmptyClick={handleEmptyClick}
      />
    )
  },
}

/**
 * 重複イベントの表示
 * 同じ時間帯のイベントは横に並べて表示されます
 */
export const OverlappingEvents: Story = {
  args: {
    events: overlappingEvents,
    height: '500px',
    startHour: 9,
    endHour: 17,
  },
  render: function Render(args) {
    const [events, setEvents] = useState(args.events)

    const handleTimeChange = useCallback((change: ScheduleEventTimeChange) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === change.eventId
            ? { ...e, startHour: change.newStartHour, endHour: change.newEndHour }
            : e
        )
      )
    }, [])

    return <Schedule {...args} events={events} onEventTimeChange={handleTimeChange} />
  },
}

/**
 * 24時間表示
 */
export const FullDay: Story = {
  args: {
    events: [
      ...sampleEvents,
      {
        id: '5',
        title: '早朝ジョギング',
        startHour: 6,
        endHour: 7,
        color: '#ec4899',
      },
      {
        id: '6',
        title: '夕食',
        startHour: 19,
        endHour: 20,
        color: '#06b6d4',
      },
    ],
    height: '800px',
    startHour: 0,
    endHour: 24,
  },
}

/**
 * 読み取り専用モード
 */
export const ReadOnly: Story = {
  args: {
    events: sampleEvents,
    height: '500px',
    startHour: 8,
    endHour: 18,
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: '読み取り専用モードではドラッグ操作ができなくなります。',
      },
    },
  },
}

/**
 * 15分刻み
 */
export const FifteenMinuteStep: Story = {
  args: {
    events: [
      {
        id: '1',
        title: '短いミーティング',
        startHour: 10,
        endHour: 10.25,
        color: '#3b82f6',
      },
      {
        id: '2',
        title: '電話会議',
        startHour: 10.5,
        endHour: 11,
        color: '#10b981',
      },
      {
        id: '3',
        title: 'レビュー',
        startHour: 11.25,
        endHour: 12,
        color: '#f59e0b',
      },
    ],
    height: '400px',
    startHour: 9,
    endHour: 13,
    timeStep: 15,
  },
  render: function Render(args) {
    const [events, setEvents] = useState(args.events)

    const handleTimeChange = useCallback((change: ScheduleEventTimeChange) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === change.eventId
            ? { ...e, startHour: change.newStartHour, endHour: change.newEndHour }
            : e
        )
      )
    }, [])

    return <Schedule {...args} events={events} onEventTimeChange={handleTimeChange} />
  },
}

/**
 * イベントなし
 */
export const Empty: Story = {
  args: {
    events: [],
    height: '400px',
    startHour: 9,
    endHour: 18,
  },
  parameters: {
    docs: {
      description: {
        story: '空の状態。空き時間をクリックすると onEmptyClick が発火します。',
      },
    },
  },
}

/**
 * カスタム高さ
 */
export const CustomHeight: Story = {
  args: {
    events: sampleEvents.slice(0, 2),
    height: '300px',
    startHour: 9,
    endHour: 14,
  },
}

/**
 * ダークモード
 */
export const DarkMode: Story = {
  args: {
    events: sampleEvents,
    height: '500px',
    startHour: 8,
    endHour: 18,
  },
  decorators: [
    (Story) => (
      <div className="dark w-full max-w-md rounded-lg bg-neutral-950 p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

/**
 * 多数のイベント
 */
export const ManyEvents: Story = {
  args: {
    events: Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      title: `イベント ${i + 1}`,
      startHour: 8 + i * 0.5,
      endHour: 9 + i * 0.5,
    })),
    height: '600px',
    startHour: 7,
    endHour: 15,
  },
  render: function Render(args) {
    const [events, setEvents] = useState(args.events)

    const handleTimeChange = useCallback((change: ScheduleEventTimeChange) => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === change.eventId
            ? { ...e, startHour: change.newStartHour, endHour: change.newEndHour }
            : e
        )
      )
    }, [])

    return <Schedule {...args} events={events} onEventTimeChange={handleTimeChange} />
  },
}
