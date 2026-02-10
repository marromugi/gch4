import { AddFill, ChevronLeft, Close, DeleteFill } from '../../icon'
import { ButtonBase } from '.'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof ButtonBase> = {
  title: 'Components/ButtonBase',
  component: ButtonBase,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'alert', 'primary-ghost', 'alert-ghost'],
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
    isLoading: {
      control: 'boolean',
      description: 'ローディング状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    children: {
      control: 'text',
      description: 'ボタンのラベル',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'アイコンの位置',
    },
  },
}

export default meta
type Story = StoryObj<typeof ButtonBase>

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

export const PrimaryGhost: Story = {
  args: {
    variant: 'primary-ghost',
    children: 'Primary Ghost Button',
  },
}

export const AlertGhost: Story = {
  args: {
    variant: 'alert-ghost',
    children: 'Alert Ghost Button',
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <ButtonBase size="xxs">XXSmall</ButtonBase>
      <ButtonBase size="xs">XSmall</ButtonBase>
      <ButtonBase size="sm">Small</ButtonBase>
      <ButtonBase size="md">Medium</ButtonBase>
      <ButtonBase size="lg">Large</ButtonBase>
    </div>
  ),
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

export const Loading: Story = {
  args: {
    children: 'Loading...',
    isLoading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
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
      <ButtonBase variant="primary" icon={AddFill}>
        Add
      </ButtonBase>
      <ButtonBase variant="secondary" icon={Close}>
        Cancel
      </ButtonBase>
      <ButtonBase variant="alert" icon={DeleteFill}>
        Delete
      </ButtonBase>
      <ButtonBase variant="primary-ghost" icon={AddFill}>
        Add
      </ButtonBase>
      <ButtonBase variant="alert-ghost" icon={DeleteFill}>
        Delete
      </ButtonBase>
    </div>
  ),
}

export const WithIconSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <ButtonBase size="xxs" icon={AddFill}>
        XXSmall
      </ButtonBase>
      <ButtonBase size="xs" icon={AddFill}>
        XSmall
      </ButtonBase>
      <ButtonBase size="sm" icon={AddFill}>
        Small
      </ButtonBase>
      <ButtonBase size="md" icon={AddFill}>
        Medium
      </ButtonBase>
      <ButtonBase size="lg" icon={AddFill}>
        Large
      </ButtonBase>
    </div>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <ButtonBase size="icon" icon={AddFill} variant="primary" />
      <ButtonBase size="icon" icon={Close} variant="secondary" />
      <ButtonBase size="icon" icon={DeleteFill} variant="alert" />
      <ButtonBase size="icon" icon={AddFill} variant="primary-ghost" />
      <ButtonBase size="icon" icon={DeleteFill} variant="alert-ghost" />
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <ButtonBase variant="primary">Primary</ButtonBase>
        <ButtonBase variant="secondary">Secondary</ButtonBase>
        <ButtonBase variant="alert">Alert</ButtonBase>
        <ButtonBase variant="primary-ghost">Primary Ghost</ButtonBase>
        <ButtonBase variant="alert-ghost">Alert Ghost</ButtonBase>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ButtonBase size="xxs">XXSmall</ButtonBase>
        <ButtonBase size="xs">XSmall</ButtonBase>
        <ButtonBase size="sm">Small</ButtonBase>
        <ButtonBase size="md">Medium</ButtonBase>
        <ButtonBase size="lg">Large</ButtonBase>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <ButtonBase variant="primary" icon={AddFill}>
          With Icon
        </ButtonBase>
        <ButtonBase variant="secondary" icon={AddFill}>
          With Icon
        </ButtonBase>
        <ButtonBase variant="alert" icon={DeleteFill}>
          With Icon
        </ButtonBase>
        <ButtonBase variant="primary-ghost" icon={AddFill}>
          With Icon
        </ButtonBase>
        <ButtonBase variant="alert-ghost" icon={DeleteFill}>
          With Icon
        </ButtonBase>
      </div>
    </div>
  ),
}
