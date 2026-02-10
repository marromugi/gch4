import { Typography } from './Typography'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['body', 'description', 'alert', 'disabled', 'fill'],
      description: 'テキストのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'テキストのサイズ',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'テキストの太さ',
    },
    as: {
      control: 'select',
      options: ['span', 'p', 'div', 'label'],
      description: 'レンダリングするHTML要素',
    },
    children: {
      control: 'text',
      description: 'テキストコンテンツ',
    },
  },
}

export default meta
type Story = StoryObj<typeof Typography>

export const Default: Story = {
  args: {
    children: 'Typography',
  },
}

export const Body: Story = {
  args: {
    variant: 'body',
    children: 'Body text',
  },
}

export const Description: Story = {
  args: {
    variant: 'description',
    children: 'Description text',
  },
}

export const Alert: Story = {
  args: {
    variant: 'alert',
    children: 'Alert text',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'disabled',
    children: 'Disabled text',
  },
}

export const Fill: Story = {
  args: {
    variant: 'fill',
    children: 'Fill text',
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#333', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Typography size="xs">Extra Small (xs)</Typography>
      <Typography size="sm">Small (sm)</Typography>
      <Typography size="md">Medium (md)</Typography>
      <Typography size="lg">Large (lg)</Typography>
      <Typography size="xl">Extra Large (xl)</Typography>
    </div>
  ),
}

export const Weights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Typography weight="normal">Normal weight</Typography>
      <Typography weight="medium">Medium weight</Typography>
      <Typography weight="semibold">Semibold weight</Typography>
      <Typography weight="bold">Bold weight</Typography>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <Typography variant="body">Body: 標準のテキストスタイル</Typography>
      </div>
      <div>
        <Typography variant="description">Description: 説明文や補足テキスト用</Typography>
      </div>
      <div>
        <Typography variant="alert">Alert: エラーや警告メッセージ用</Typography>
      </div>
      <div>
        <Typography variant="disabled">Disabled: 無効状態のテキスト用</Typography>
      </div>
      <div style={{ backgroundColor: '#333', padding: '0.5rem' }}>
        <Typography variant="fill">Fill: 背景色付きコンテンツ用</Typography>
      </div>
    </div>
  ),
}

export const CombinedStyles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Typography size="lg" weight="bold">
        Large Bold Text
      </Typography>
      <Typography size="md" weight="semibold" variant="description">
        Medium Semibold Description
      </Typography>
      <Typography size="sm" weight="medium" variant="alert">
        Small Medium Alert
      </Typography>
    </div>
  ),
}
