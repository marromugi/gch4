import { AddFill, ChevronLeft, Close, DeleteFill } from '../../icon'
import { Button } from './Button'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'alert'],
      description: 'ボタンのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['xxs', 'xs', 'sm', 'md', 'lg', 'icon'],
      description: 'ボタンのサイズ',
    },
    fullWidth: {
      control: 'boolean',
      description: '幅を100%にする',
    },
    children: {
      control: 'text',
      description: 'ボタンのラベル',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'アイコンの位置',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const Alert: Story = {
  args: {
    variant: 'alert',
    children: 'Alert Button',
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button size="xxs">XXSmall</Button>
      <Button size="xs">XSmall</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
}

export const WithIcon: Story = {
  args: {
    icon: AddFill,
    children: 'Add Item',
  },
}

export const WithIconRight: Story = {
  args: {
    icon: ChevronLeft,
    iconPosition: 'right',
    children: 'Next',
  },
}

export const WithIconVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="primary" icon={AddFill}>
        Add
      </Button>
      <Button variant="secondary" icon={Close}>
        Cancel
      </Button>
      <Button variant="alert" icon={DeleteFill}>
        Delete
      </Button>
    </div>
  ),
}

export const WithIconSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button size="xxs" icon={AddFill}>
        XXSmall
      </Button>
      <Button size="xs" icon={AddFill}>
        XSmall
      </Button>
      <Button size="sm" icon={AddFill}>
        Small
      </Button>
      <Button size="md" icon={AddFill}>
        Medium
      </Button>
      <Button size="lg" icon={AddFill}>
        Large
      </Button>
    </div>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button size="icon" icon={AddFill} variant="primary" />
      <Button size="icon" icon={Close} variant="secondary" />
      <Button size="icon" icon={DeleteFill} variant="alert" />
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="alert">Alert</Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button size="xxs">XXSmall</Button>
        <Button size="xs">XSmall</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="primary" icon={AddFill}>
          With Icon
        </Button>
        <Button variant="secondary" icon={AddFill}>
          With Icon
        </Button>
        <Button variant="alert" icon={DeleteFill}>
          With Icon
        </Button>
      </div>
    </div>
  ),
}
