import { useState } from 'react'
import { RadioGroup } from './RadioGroup'
import { RadioGroupItem } from './RadioGroupItem'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'ラジオボタンのサイズ',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '配置方向',
    },
    disabled: {
      control: 'boolean',
      description: 'グループ全体を無効にする',
    },
    required: {
      control: 'boolean',
      description: '必須フィールド',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <RadioGroupItem value="option1">オプション 1</RadioGroupItem>
      <RadioGroupItem value="option2">オプション 2</RadioGroupItem>
      <RadioGroupItem value="option3">オプション 3</RadioGroupItem>
    </RadioGroup>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('apple')
    return (
      <div>
        <RadioGroup value={value} onValueChange={setValue}>
          <RadioGroupItem value="apple">りんご</RadioGroupItem>
          <RadioGroupItem value="banana">バナナ</RadioGroupItem>
          <RadioGroupItem value="orange">オレンジ</RadioGroupItem>
        </RadioGroup>
        <p style={{ marginTop: '1rem', color: '#666' }}>選択中: {value}</p>
      </div>
    )
  },
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="small" orientation="horizontal">
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem value="medium">Medium</RadioGroupItem>
      <RadioGroupItem value="large">Large</RadioGroupItem>
    </RadioGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Small (sm)</p>
        <RadioGroup defaultValue="option1" size="sm">
          <RadioGroupItem value="option1">オプション 1</RadioGroupItem>
          <RadioGroupItem value="option2">オプション 2</RadioGroupItem>
        </RadioGroup>
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Medium (md)</p>
        <RadioGroup defaultValue="option1" size="md">
          <RadioGroupItem value="option1">オプション 1</RadioGroupItem>
          <RadioGroupItem value="option2">オプション 2</RadioGroupItem>
        </RadioGroup>
      </div>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" disabled>
      <RadioGroupItem value="option1">無効なオプション 1</RadioGroupItem>
      <RadioGroupItem value="option2">無効なオプション 2</RadioGroupItem>
      <RadioGroupItem value="option3">無効なオプション 3</RadioGroupItem>
    </RadioGroup>
  ),
}

export const DisabledItems: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <RadioGroupItem value="option1">有効なオプション</RadioGroupItem>
      <RadioGroupItem value="option2" disabled>
        無効なオプション
      </RadioGroupItem>
      <RadioGroupItem value="option3">有効なオプション</RadioGroupItem>
    </RadioGroup>
  ),
}

export const WithoutLabels: Story = {
  render: () => (
    <RadioGroup defaultValue="red" orientation="horizontal">
      <RadioGroupItem value="red" aria-label="赤" />
      <RadioGroupItem value="green" aria-label="緑" />
      <RadioGroupItem value="blue" aria-label="青" />
    </RadioGroup>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-neutral-900 p-6 rounded-lg">
      <RadioGroup defaultValue="option2">
        <RadioGroupItem value="option1">ダークモード オプション 1</RadioGroupItem>
        <RadioGroupItem value="option2">ダークモード オプション 2</RadioGroupItem>
        <RadioGroupItem value="option3" disabled>
          ダークモード 無効なオプション
        </RadioGroupItem>
      </RadioGroup>
    </div>
  ),
}

export const FormExample: Story = {
  render: () => {
    const [submitted, setSubmitted] = useState<string | null>(null)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          setSubmitted(formData.get('plan') as string)
        }}
      >
        <fieldset style={{ border: 'none', padding: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: '1rem' }}>
            プランを選択してください
          </legend>
          <RadioGroup name="plan" defaultValue="basic" required>
            <RadioGroupItem value="basic">ベーシック - 月額 ¥1,000</RadioGroupItem>
            <RadioGroupItem value="standard">スタンダード - 月額 ¥2,000</RadioGroupItem>
            <RadioGroupItem value="premium">プレミアム - 月額 ¥5,000</RadioGroupItem>
          </RadioGroup>
        </fieldset>
        <button
          type="submit"
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#171717',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          送信
        </button>
        {submitted && (
          <p style={{ marginTop: '1rem', color: '#16a34a' }}>選択されたプラン: {submitted}</p>
        )}
      </form>
    )
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* サイズ比較 */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>サイズ</h3>
        <div style={{ display: 'flex', gap: '3rem' }}>
          <RadioGroup defaultValue="a" size="sm">
            <RadioGroupItem value="a">Small</RadioGroupItem>
            <RadioGroupItem value="b">Small</RadioGroupItem>
          </RadioGroup>
          <RadioGroup defaultValue="a" size="md">
            <RadioGroupItem value="a">Medium</RadioGroupItem>
            <RadioGroupItem value="b">Medium</RadioGroupItem>
          </RadioGroup>
        </div>
      </div>

      {/* 方向比較 */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>方向</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <RadioGroup defaultValue="a" orientation="vertical">
            <RadioGroupItem value="a">Vertical 1</RadioGroupItem>
            <RadioGroupItem value="b">Vertical 2</RadioGroupItem>
          </RadioGroup>
          <RadioGroup defaultValue="a" orientation="horizontal">
            <RadioGroupItem value="a">Horizontal 1</RadioGroupItem>
            <RadioGroupItem value="b">Horizontal 2</RadioGroupItem>
          </RadioGroup>
        </div>
      </div>

      {/* 状態比較 */}
      <div>
        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>状態</h3>
        <div style={{ display: 'flex', gap: '3rem' }}>
          <RadioGroup defaultValue="a">
            <RadioGroupItem value="a">通常</RadioGroupItem>
            <RadioGroupItem value="b">通常</RadioGroupItem>
          </RadioGroup>
          <RadioGroup defaultValue="a" disabled>
            <RadioGroupItem value="a">無効</RadioGroupItem>
            <RadioGroupItem value="b">無効</RadioGroupItem>
          </RadioGroup>
        </div>
      </div>
    </div>
  ),
}
