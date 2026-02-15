import { Flex } from './Flex'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      description: 'フレックス方向',
    },
    justify: {
      control: 'select',
      options: [undefined, 'start', 'center', 'end', 'between', 'around', 'evenly'],
      description: '主軸方向の配置',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: '交差軸方向の配置',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: '折り返し設定',
    },
    gap: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      description: '要素間の間隔',
    },
    inline: {
      control: 'boolean',
      description: 'inline-flex として表示',
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'main', 'aside', 'header', 'footer', 'nav'],
      description: 'レンダリングするHTML要素',
    },
  },
}

export default meta
type Story = StoryObj<typeof Flex>

const Box = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '1rem', background: '#e5e7eb', borderRadius: '0.25rem' }}>{children}</div>
)

export const Default: Story = {
  args: {
    gap: 4,
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
      </>
    ),
  },
}

export const DirectionVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem' }}>row (default)</p>
        <Flex direction="row" gap={4}>
          <Box>1</Box>
          <Box>2</Box>
          <Box>3</Box>
        </Flex>
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem' }}>column</p>
        <Flex direction="column" gap={4}>
          <Box>1</Box>
          <Box>2</Box>
          <Box>3</Box>
        </Flex>
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem' }}>row-reverse</p>
        <Flex direction="row-reverse" gap={4}>
          <Box>1</Box>
          <Box>2</Box>
          <Box>3</Box>
        </Flex>
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem' }}>column-reverse</p>
        <Flex direction="column-reverse" gap={4}>
          <Box>1</Box>
          <Box>2</Box>
          <Box>3</Box>
        </Flex>
      </div>
    </div>
  ),
}

export const JustifyVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((justify) => (
        <div key={justify}>
          <p style={{ marginBottom: '0.5rem' }}>{justify}</p>
          <Flex justify={justify} gap={4} style={{ background: '#f3f4f6', padding: '0.5rem' }}>
            <Box>1</Box>
            <Box>2</Box>
            <Box>3</Box>
          </Flex>
        </div>
      ))}
    </div>
  ),
}

export const AlignVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((align) => (
        <div key={align}>
          <p style={{ marginBottom: '0.5rem' }}>{align}</p>
          <Flex
            align={align}
            gap={4}
            style={{ background: '#f3f4f6', padding: '0.5rem', minHeight: '80px' }}
          >
            <Box>Short</Box>
            <Box>
              Tall
              <br />
              Item
            </Box>
            <Box>Medium</Box>
          </Flex>
        </div>
      ))}
    </div>
  ),
}

export const GapVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {([0, 2, 4, 6, 8, 10] as const).map((gap) => (
        <div key={gap}>
          <p style={{ marginBottom: '0.5rem' }}>gap={gap}</p>
          <Flex gap={gap}>
            <Box>1</Box>
            <Box>2</Box>
            <Box>3</Box>
          </Flex>
        </div>
      ))}
    </div>
  ),
}

export const WrapVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem' }}>wrap</p>
        <Flex wrap="wrap" gap={4} style={{ maxWidth: '300px', background: '#f3f4f6' }}>
          <Box>Item 1</Box>
          <Box>Item 2</Box>
          <Box>Item 3</Box>
          <Box>Item 4</Box>
          <Box>Item 5</Box>
        </Flex>
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem' }}>wrap-reverse</p>
        <Flex wrap="wrap-reverse" gap={4} style={{ maxWidth: '300px', background: '#f3f4f6' }}>
          <Box>Item 1</Box>
          <Box>Item 2</Box>
          <Box>Item 3</Box>
          <Box>Item 4</Box>
          <Box>Item 5</Box>
        </Flex>
      </div>
    </div>
  ),
}

export const InlineFlex: Story = {
  render: () => (
    <div>
      <p style={{ marginBottom: '0.5rem' }}>
        Inline flex:
        <Flex inline gap={2} style={{ margin: '0 0.5rem' }}>
          <Box>A</Box>
          <Box>B</Box>
        </Flex>
        continues in the same line.
      </p>
    </div>
  ),
}
