import type { Meta, StoryObj } from '@storybook/react'
import { AudioPlayer } from './AudioPlayer'

const meta: Meta<typeof AudioPlayer> = {
  title: 'Components/AudioPlayer',
  component: AudioPlayer,
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: '音声ファイルのURL',
    },
    fileName: {
      control: 'text',
      description: '表示用ファイル名（オプション）',
    },
    placeholder: {
      control: 'text',
      description: 'fileNameがない時に表示するプレースホルダー',
    },
    className: {
      control: 'text',
      description: '追加のCSSクラス',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AudioPlayer>

const SAMPLE_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

export const Default: Story = {
  args: {
    src: SAMPLE_AUDIO_URL,
  },
}

export const WithFileName: Story = {
  args: {
    src: SAMPLE_AUDIO_URL,
    fileName: 'sample-audio.mp3',
  },
}

export const WithPlaceholder: Story = {
  args: {
    src: SAMPLE_AUDIO_URL,
    placeholder: '音声メッセージ',
  },
}

export const LongFileName: Story = {
  args: {
    src: SAMPLE_AUDIO_URL,
    fileName: 'very-long-file-name-that-should-be-truncated-when-displayed-in-the-player.mp3',
  },
}

export const MultipleAudios: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <AudioPlayer src={SAMPLE_AUDIO_URL} fileName="audio-1.mp3" />
      <AudioPlayer src={SAMPLE_AUDIO_URL} fileName="audio-2.mp3" />
      <AudioPlayer src={SAMPLE_AUDIO_URL} placeholder="音声メッセージ" />
    </div>
  ),
}

export const DarkModePreview: Story = {
  args: {
    src: SAMPLE_AUDIO_URL,
    fileName: 'sample-audio.mp3',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ maxWidth: '400px', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
}
