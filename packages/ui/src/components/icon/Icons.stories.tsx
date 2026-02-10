import {
  AddFill,
  ChevronLeft,
  ClipFill,
  Close,
  DeleteFill,
  MoonFill,
  MoreVert,
  MovieFill,
  SunFill,
} from './index'
import type { Meta, StoryObj } from '@storybook/react'
import type { SVGProps } from 'react'

type IconComponent = (props: SVGProps<SVGSVGElement>) => React.JSX.Element

const icons: Record<string, IconComponent> = {
  AddFill,
  ChevronLeft,
  ClipFill,
  Close,
  DeleteFill,
  MoonFill,
  MoreVert,
  MovieFill,
  SunFill,
}

const meta: Meta = {
  title: 'Icons/IconGallery',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '1.5rem',
        padding: '2rem',
      }}
    >
      {Object.entries(icons).map(([name, Icon]) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Icon width={32} height={32} />
          <span style={{ fontSize: '0.75rem', color: '#666' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <AddFill width={16} height={16} />
      <AddFill width={24} height={24} />
      <AddFill width={32} height={32} />
      <AddFill width={48} height={48} />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <AddFill style={{ color: '#000000' }} />
      <AddFill style={{ color: '#3b82f6' }} />
      <AddFill style={{ color: '#ef4444' }} />
      <AddFill style={{ color: '#22c55e' }} />
    </div>
  ),
}
