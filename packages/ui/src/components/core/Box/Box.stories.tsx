import { Box } from './Box'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
  tags: ['autodocs'],
  argTypes: {
    background: {
      control: 'select',
      options: [undefined, 'background', 'surface', 'muted', 'subtle'],
      description: '背景色のバリアント',
    },
    border: {
      control: 'select',
      options: [undefined, true, 'background', 'surface', 'muted', 'subtle'],
      description: 'ボーダー（true でデフォルト、または variant 指定）',
    },
    elevation: {
      control: 'select',
      options: [undefined, 'low', 'mid', 'high'],
      description: '影の強さ',
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'main', 'aside', 'header', 'footer', 'nav'],
      description: 'レンダリングするHTML要素',
    },
  },
}

export default meta
type Story = StoryObj<typeof Box>

export const Default: Story = {
  args: {
    children: 'Default Box (no styles)',
    style: { padding: '1rem' },
  },
}

export const BackgroundVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Box background="background" style={{ padding: '1rem' }}>
        background
      </Box>
      <Box background="surface" style={{ padding: '1rem' }}>
        surface
      </Box>
      <Box background="muted" style={{ padding: '1rem' }}>
        muted
      </Box>
      <Box background="subtle" style={{ padding: '1rem' }}>
        subtle
      </Box>
    </div>
  ),
}

export const BorderBoolean: Story = {
  args: {
    border: true,
    children: 'border={true} (default: muted)',
    style: { padding: '1rem' },
  },
}

export const BorderVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Box border style={{ padding: '1rem' }}>
        border (default)
      </Box>
      <Box border="background" style={{ padding: '1rem' }}>
        background
      </Box>
      <Box border="surface" style={{ padding: '1rem' }}>
        surface
      </Box>
      <Box border="muted" style={{ padding: '1rem' }}>
        muted
      </Box>
      <Box border="subtle" style={{ padding: '1rem' }}>
        subtle
      </Box>
    </div>
  ),
}

export const Combined: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Box background="background" border="background" style={{ padding: '1rem' }}>
        background + background border
      </Box>
      <Box background="surface" border="surface" style={{ padding: '1rem' }}>
        surface + surface border
      </Box>
      <Box background="muted" border="muted" style={{ padding: '1rem' }}>
        muted + muted border
      </Box>
      <Box background="subtle" border="subtle" style={{ padding: '1rem' }}>
        subtle + subtle border
      </Box>
    </div>
  ),
}

export const ElevationVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Box elevation="low" style={{ padding: '1rem' }}>
        low
      </Box>
      <Box elevation="mid" style={{ padding: '1rem' }}>
        mid
      </Box>
      <Box elevation="high" style={{ padding: '1rem' }}>
        high
      </Box>
    </div>
  ),
}

export const AsSection: Story = {
  args: {
    as: 'section',
    background: 'surface',
    border: 'surface',
    children: 'Rendered as <section>',
    style: { padding: '1rem' },
  },
}
