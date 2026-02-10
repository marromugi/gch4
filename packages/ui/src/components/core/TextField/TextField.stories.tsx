import { TextField } from '.'
import { FormFieldWrapper } from '../FormFieldWrapper'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'テキストフィールドのサイズ',
    },
    error: {
      control: 'boolean',
      description: 'エラー状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダー',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TextField>

export const Default: Story = {
  args: {
    placeholder: '入力してください',
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <TextField size="sm" placeholder="Small" />
      <TextField size="md" placeholder="Medium" />
      <TextField size="lg" placeholder="Large" />
    </div>
  ),
}

export const WithValue: Story = {
  args: {
    defaultValue: 'テキスト入力済み',
  },
}

export const Error: Story = {
  args: {
    error: true,
    placeholder: 'エラー状態',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: '無効状態',
  },
}

export const WithFormFieldWrapper: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <FormFieldWrapper label="ユーザー名" htmlFor="username">
        <TextField id="username" placeholder="例: tanaka_taro" />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="メールアドレス"
        description="通知の送信先として使用します"
        required
        htmlFor="email"
      >
        <TextField id="email" type="email" placeholder="example@email.com" />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="パスワード"
        error="パスワードは8文字以上である必要があります"
        required
        htmlFor="password"
      >
        <TextField id="password" type="password" error placeholder="8文字以上" />
      </FormFieldWrapper>

      <FormFieldWrapper label="会社名" description="変更できません" disabled htmlFor="company">
        <TextField id="company" disabled defaultValue="株式会社サンプル" />
      </FormFieldWrapper>
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <TextField placeholder="デフォルト" />
      <TextField placeholder="エラー" error />
      <TextField placeholder="無効" disabled />
      <TextField defaultValue="入力済み" />
      <TextField defaultValue="エラー + 入力済み" error />
    </div>
  ),
}
