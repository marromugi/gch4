import { Photo } from '../../icon'
import { Icon } from '../Icon'
import { Image } from './Image'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Image> = {
  title: 'Components/Image',
  component: Image,
  tags: ['autodocs'],
  argTypes: {
    radius: {
      control: 'select',
      options: [undefined, 'none', 'sm', 'md', 'lg', 'full'],
      description: '角丸のバリアント',
    },
    objectFit: {
      control: 'select',
      options: [undefined, 'cover', 'contain', 'fill', 'none'],
      description: 'object-fit のバリアント',
    },
    isLoading: {
      control: 'boolean',
      description: '読み込み中の状態を外部から制御',
    },
  },
}

export default meta
type Story = StoryObj<typeof Image>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'サンプル画像',
    width: 400,
    height: 300,
  },
}

export const RadiusVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
        <Image
          key={r}
          src="https://picsum.photos/150/150"
          alt={`radius: ${r}`}
          width={150}
          height={150}
          radius={r}
        />
      ))}
    </div>
  ),
}

export const ObjectFitVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {(['cover', 'contain', 'fill', 'none'] as const).map((fit) => (
        <div key={fit} style={{ width: 200, height: 150, border: '1px solid #ccc' }}>
          <Image
            src="https://picsum.photos/400/300"
            alt={`objectFit: ${fit}`}
            objectFit={fit}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ))}
    </div>
  ),
}

export const LoadingState: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'ローディング中の画像',
    width: 400,
    height: 300,
    isLoading: true,
    radius: 'md',
  },
}

export const ErrorWithFallback: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.example/image.jpg',
    alt: 'エラー画像',
    width: 400,
    height: 300,
    radius: 'md',
    fallback: (
      <div
        style={{
          width: 400,
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#CCC',
          borderRadius: '0.375rem',
          color: '#666',
        }}
      >
        <Icon icon={Photo} className="size-20" variant={'description'} />
      </div>
    ),
  },
}

export const Decorative: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: '',
    width: 400,
    height: 300,
  },
}
