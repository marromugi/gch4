import { useState } from 'react'
import { Tooltip } from '../Tooltip'
import { Tab } from './Tab'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Tab> = {
  title: 'Components/Tab',
  component: Tab,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'タブのサイズ',
    },
    minWidth: {
      control: 'number',
      description: '各タブの最小幅（px）',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Tab>

const defaultItems = [
  { value: 'tweet', label: <span className="font-semibold">つぶやく</span> },
  { value: 'ask', label: '聞く' },
]

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('tweet')
    return <Tab items={defaultItems} value={value} onChange={setValue} />
  },
}

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState('tweet')
    return <Tab items={defaultItems} value={value} onChange={setValue} size="sm" />
  },
}

export const WithMinWidth: Story = {
  render: () => {
    const [value, setValue] = useState('tweet')
    return <Tab items={defaultItems} value={value} onChange={setValue} minWidth={120} />
  },
}

export const ManyTabs: Story = {
  render: () => {
    const items = [
      { value: 'all', label: '全て' },
      { value: 'active', label: 'アクティブ' },
      { value: 'completed', label: '完了' },
      { value: 'archived', label: 'アーカイブ' },
    ]
    const [value, setValue] = useState('all')
    return <Tab items={items} value={value} onChange={setValue} />
  },
}

export const Sizes: Story = {
  render: () => {
    const [value, setValue] = useState('tweet')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Small</p>
          <Tab items={defaultItems} value={value} onChange={setValue} size="sm" />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Medium (default)
          </p>
          <Tab items={defaultItems} value={value} onChange={setValue} size="md" />
        </div>
      </div>
    )
  },
}

export const WithTooltip: Story = {
  render: () => {
    const items = [
      {
        value: 'tweet',
        label: (
          <Tooltip content="思ったことをつぶやく" placement="bottom">
            <span>つぶやく</span>
          </Tooltip>
        ),
      },
      {
        value: 'ask',
        label: (
          <Tooltip content="AIに質問する" placement="bottom">
            <span>聞く</span>
          </Tooltip>
        ),
      },
    ]
    const [value, setValue] = useState('tweet')
    return <Tab items={items} value={value} onChange={setValue} />
  },
}
