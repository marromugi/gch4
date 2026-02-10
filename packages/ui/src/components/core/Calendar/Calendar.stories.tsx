import { useState } from 'react'
import { Calendar } from './Calendar'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'select',
      options: ['en', 'ja', 'zh', 'ko', 'fr', 'de'],
      description: 'ロケール',
    },
    weekStartsOn: {
      control: 'select',
      options: [0, 1],
      description: '週の開始曜日（0=日曜, 1=月曜）',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  args: {},
}

export const WithSelectedDate: Story = {
  args: {
    defaultValue: new Date(2025, 0, 15),
  },
}

export const JapaneseLocale: Story = {
  args: {
    locale: 'ja',
  },
}

export const MondayStart: Story = {
  args: {
    weekStartsOn: 1,
  },
}

export const JapaneseMondayStart: Story = {
  args: {
    locale: 'ja',
    weekStartsOn: 1,
  },
}

export const Controlled: Story = {
  render: () => {
    const [date, setDate] = useState<Date>(new Date(2025, 5, 10))

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Calendar value={date} onChange={setDate} locale="ja" />
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          選択中: {date.toLocaleDateString('ja')}
        </p>
      </div>
    )
  },
}

export const WithMarkers: Story = {
  args: {
    defaultValue: new Date(2025, 0, 15),
    markers: [
      { date: new Date(2025, 0, 5), color: '#ef4444' },
      { date: new Date(2025, 0, 10), color: '#3b82f6' },
      { date: new Date(2025, 0, 10), color: '#ef4444' },
      { date: new Date(2025, 0, 15), color: '#22c55e' },
      { date: new Date(2025, 0, 20), color: '#f59e0b' },
      { date: new Date(2025, 0, 20), color: '#3b82f6' },
      { date: new Date(2025, 0, 20), color: '#ef4444' },
      { date: new Date(2025, 0, 25), color: '#8b5cf6' },
    ],
  },
}

export const AllLocales: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 320px)',
        gap: '2rem',
      }}
    >
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>English</p>
        <Calendar locale="en" defaultValue={new Date(2025, 0, 15)} />
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>日本語</p>
        <Calendar locale="ja" defaultValue={new Date(2025, 0, 15)} />
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Français</p>
        <Calendar locale="fr" defaultValue={new Date(2025, 0, 15)} />
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>中文</p>
        <Calendar locale="zh" defaultValue={new Date(2025, 0, 15)} />
      </div>
    </div>
  ),
  decorators: [],
}
