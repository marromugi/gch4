import { AddFill, ChevronLeft, Close, DeleteFill, MoonFill, SunFill } from '../../icon'
import { Icon } from './Icon'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Icon> = {
  title: 'Core/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: 'アイコンコンポーネント',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'アイコンのサイズ',
    },
    variant: {
      control: 'select',
      options: ['body', 'description', 'alert', 'disabled', 'fill'],
      description: 'アイコンの色バリアント',
    },
    className: {
      control: 'text',
      description: '追加のCSSクラス',
    },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    icon: AddFill,
    size: 'md',
    variant: 'body',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={AddFill} size="xs" />
      <Icon icon={AddFill} size="sm" />
      <Icon icon={AddFill} size="md" />
      <Icon icon={AddFill} size="lg" />
      <Icon icon={AddFill} size="xl" />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Icon icon={AddFill} size="lg" variant="body" />
      <Icon icon={AddFill} size="lg" variant="description" />
      <Icon icon={AddFill} size="lg" variant="alert" />
      <Icon icon={AddFill} size="lg" variant="disabled" />
      <div className="bg-neutral-900 p-2 rounded">
        <Icon icon={AddFill} size="lg" variant="fill" />
      </div>
    </div>
  ),
}

export const DifferentIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Icon icon={AddFill} size="lg" />
      <Icon icon={ChevronLeft} size="lg" />
      <Icon icon={Close} size="lg" />
      <Icon icon={DeleteFill} size="lg" />
      <Icon icon={MoonFill} size="lg" />
      <Icon icon={SunFill} size="lg" />
    </div>
  ),
}

export const WithCustomClass: Story = {
  args: {
    icon: AddFill,
    size: 'lg',
    className: 'opacity-50 hover:opacity-100 transition-opacity cursor-pointer',
  },
}

export const InlineWithText: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1">
        <Icon icon={AddFill} size="sm" />
        <span>小さいアイコン</span>
      </p>
      <p className="flex items-center gap-2">
        <Icon icon={AddFill} size="md" />
        <span>標準アイコン</span>
      </p>
      <p className="flex items-center gap-2">
        <Icon icon={AddFill} size="lg" />
        <span>大きいアイコン</span>
      </p>
    </div>
  ),
}

export const AllSizesAndVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-8 text-xs text-neutral-500">{size}</span>
          <Icon icon={AddFill} size={size} variant="body" />
          <Icon icon={AddFill} size={size} variant="description" />
          <Icon icon={AddFill} size={size} variant="alert" />
          <Icon icon={AddFill} size={size} variant="disabled" />
          <div className="bg-neutral-900 p-1 rounded">
            <Icon icon={AddFill} size={size} variant="fill" />
          </div>
        </div>
      ))}
    </div>
  ),
}
