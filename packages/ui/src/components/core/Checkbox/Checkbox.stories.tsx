import { useState } from 'react'
import { Checkbox } from '.'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'チェックボックスのサイズ',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    label: {
      control: 'text',
      description: 'ラベルテキスト',
    },
    checked: {
      control: 'boolean',
      description: 'チェック状態',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {
    label: 'チェックボックス',
  },
}

export const Checked: Story = {
  args: {
    label: 'チェック済み',
    defaultChecked: true,
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Checkbox size="sm" label="Small" />
      <Checkbox size="md" label="Medium" />
      <Checkbox size="lg" label="Large" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    label: '無効状態',
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    label: '無効 + チェック済み',
    disabled: true,
    defaultChecked: true,
  },
}

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Checkbox
          label={`必須: ${checked ? 'はい' : 'いいえ'}`}
          checked={checked}
          onCheckedChange={setChecked}
        />
      </div>
    )
  },
}

export const WithoutLabel: Story = {
  args: {},
}
