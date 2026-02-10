import { Tooltip } from './Tooltip'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'ツールチップの内容',
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: '表示位置',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: '揃え位置',
    },
    delay: {
      control: 'number',
      description: 'ホバーから表示までの遅延（ms）',
    },
    arrow: {
      control: 'boolean',
      description: '矢印の表示',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    content: 'ツールチップ',
    children: <button>ホバーしてください</button>,
  },
}

export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
      <Tooltip content="上" placement="top">
        <button>Top</button>
      </Tooltip>
      <Tooltip content="下" placement="bottom">
        <button>Bottom</button>
      </Tooltip>
      <Tooltip content="左" placement="left">
        <button>Left</button>
      </Tooltip>
      <Tooltip content="右" placement="right">
        <button>Right</button>
      </Tooltip>
    </div>
  ),
}

export const Alignments: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '3rem' }}>
        <Tooltip content="Start" placement="top" align="start">
          <button>Top Start</button>
        </Tooltip>
        <Tooltip content="Center" placement="top" align="center">
          <button>Top Center</button>
        </Tooltip>
        <Tooltip content="End" placement="top" align="end">
          <button>Top End</button>
        </Tooltip>
      </div>
      <div style={{ display: 'flex', gap: '3rem' }}>
        <Tooltip content="Start" placement="bottom" align="start">
          <button>Bottom Start</button>
        </Tooltip>
        <Tooltip content="Center" placement="bottom" align="center">
          <button>Bottom Center</button>
        </Tooltip>
        <Tooltip content="End" placement="bottom" align="end">
          <button>Bottom End</button>
        </Tooltip>
      </div>
    </div>
  ),
}

export const WithDelay: Story = {
  args: {
    content: '500ms遅延',
    delay: 500,
    children: <button>遅延あり</button>,
  },
}

export const WithoutArrow: Story = {
  args: {
    content: '矢印なし',
    arrow: false,
    children: <button>矢印なし</button>,
  },
}

export const Disabled: Story = {
  args: {
    content: '表示されない',
    disabled: true,
    children: <button>無効状態</button>,
  },
}

export const RichContent: Story = {
  args: {
    content: (
      <span>
        <strong>太字テキスト</strong>も使えます
      </span>
    ),
    children: <button>リッチコンテンツ</button>,
  },
}

export const WithOffset: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
      <Tooltip content="デフォルト (8px)" placement="top">
        <button>Default</button>
      </Tooltip>
      <Tooltip content="0px" placement="top" offset={0}>
        <button>Offset 0</button>
      </Tooltip>
      <Tooltip content="16px" placement="top" offset={16}>
        <button>Offset 16</button>
      </Tooltip>
      <Tooltip content="24px" placement="bottom" offset={24}>
        <button>Offset 24</button>
      </Tooltip>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
        <Tooltip content="Top" placement="top">
          <button>Top</button>
        </Tooltip>
        <Tooltip content="Bottom" placement="bottom">
          <button>Bottom</button>
        </Tooltip>
        <Tooltip content="Left" placement="left">
          <button>Left</button>
        </Tooltip>
        <Tooltip content="Right" placement="right">
          <button>Right</button>
        </Tooltip>
      </div>
      <div style={{ display: 'flex', gap: '3rem' }}>
        <Tooltip content="矢印あり" placement="top" arrow>
          <button>Arrow</button>
        </Tooltip>
        <Tooltip content="矢印なし" placement="top" arrow={false}>
          <button>No Arrow</button>
        </Tooltip>
        <Tooltip content="500ms遅延" placement="top" delay={500}>
          <button>Delay</button>
        </Tooltip>
      </div>
    </div>
  ),
}
