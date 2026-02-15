import { Grid } from './Grid'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
      description: 'グリッドの列数',
    },
    rows: {
      control: 'select',
      options: [undefined, 1, 2, 3, 4, 5, 6],
      description: 'グリッドの行数',
    },
    gap: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      description: '要素間の間隔',
    },
    flow: {
      control: 'select',
      options: ['row', 'column', 'dense', 'row-dense', 'column-dense'],
      description: 'グリッドの配置方向',
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'main', 'aside', 'header', 'footer', 'nav'],
      description: 'レンダリングするHTML要素',
    },
  },
}

export default meta
type Story = StoryObj<typeof Grid>

const Box = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '1rem', background: '#e5e7eb', borderRadius: '0.25rem' }}>{children}</div>
)

export const Default: Story = {
  args: {
    columns: 3,
    gap: 4,
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
        <Box>Item 4</Box>
        <Box>Item 5</Box>
        <Box>Item 6</Box>
      </>
    ),
  },
}

export const ColumnVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {([1, 2, 3, 4, 5, 6] as const).map((columns) => (
        <div key={columns}>
          <p style={{ marginBottom: '0.5rem' }}>columns={columns}</p>
          <Grid columns={columns} gap={4}>
            {Array.from({ length: columns * 2 }, (_, i) => (
              <Box key={i}>{i + 1}</Box>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
}

export const GapVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {([0, 2, 4, 6, 8, 10] as const).map((gap) => (
        <div key={gap}>
          <p style={{ marginBottom: '0.5rem' }}>gap={gap}</p>
          <Grid columns={3} gap={gap}>
            <Box>1</Box>
            <Box>2</Box>
            <Box>3</Box>
            <Box>4</Box>
            <Box>5</Box>
            <Box>6</Box>
          </Grid>
        </div>
      ))}
    </div>
  ),
}

export const WithRows: Story = {
  args: {
    columns: 3,
    rows: 2,
    gap: 4,
    children: (
      <>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
        <Box>Item 4</Box>
        <Box>Item 5</Box>
        <Box>Item 6</Box>
      </>
    ),
  },
}

export const FlowColumn: Story = {
  render: () => (
    <div>
      <p style={{ marginBottom: '0.5rem' }}>flow=&quot;column&quot; with rows=3</p>
      <Grid columns={3} rows={3} flow="column" gap={4} style={{ height: '250px' }}>
        <Box>1</Box>
        <Box>2</Box>
        <Box>3</Box>
        <Box>4</Box>
        <Box>5</Box>
        <Box>6</Box>
        <Box>7</Box>
        <Box>8</Box>
        <Box>9</Box>
      </Grid>
    </div>
  ),
}

export const ResponsiveExample: Story = {
  render: () => (
    <div>
      <p style={{ marginBottom: '0.5rem' }}>
        className でレスポンシブ対応可能（例: sm:grid-cols-2 md:grid-cols-4）
      </p>
      <Grid columns={1} gap={4} className="sm:grid-cols-2 md:grid-cols-4">
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
        <Box>Item 4</Box>
        <Box>Item 5</Box>
        <Box>Item 6</Box>
        <Box>Item 7</Box>
        <Box>Item 8</Box>
      </Grid>
    </div>
  ),
}
