import { FormFieldWrapper } from './FormFieldWrapper'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof FormFieldWrapper> = {
  title: 'Components/FormFieldWrapper',
  component: FormFieldWrapper,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'フィールドのラベル',
    },
    description: {
      control: 'text',
      description: '説明文',
    },
    error: {
      control: 'text',
      description: 'エラーメッセージ',
    },
    required: {
      control: 'boolean',
      description: '必須マーク表示',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
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
type Story = StoryObj<typeof FormFieldWrapper>

// ダミー入力コンポーネント
const DummyInput = ({ disabled = false }: { disabled?: boolean }) => (
  <input
    type="text"
    disabled={disabled}
    className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 disabled:opacity-50"
    placeholder="入力してください"
  />
)

export const Default: Story = {
  args: {
    label: '最大数',
    children: <DummyInput />,
  },
}

export const WithDescription: Story = {
  args: {
    label: '最大数',
    description:
      'Todoが増えすぎて管理できないことを阻止するために、作成できるTodoの個数に制限を設けます。完了したTodoは最大数の換算に含みません。',
    children: <DummyInput />,
  },
}

export const Required: Story = {
  args: {
    label: 'ユーザー名',
    required: true,
    children: <DummyInput />,
  },
}

export const WithError: Story = {
  args: {
    label: '最大数',
    description:
      'Todoが増えすぎて管理できないことを阻止するために、作成できるTodoの個数に制限を設けます。完了したTodoは最大数の換算に含みません。',
    error: '入力内容にエラーがあります',
    children: <DummyInput />,
  },
}

export const RequiredWithError: Story = {
  args: {
    label: 'ユーザー名',
    required: true,
    error: 'ユーザー名は必須です',
    children: <DummyInput />,
  },
}

export const Disabled: Story = {
  args: {
    label: '最大数',
    description: 'この項目は変更できません',
    disabled: true,
    children: <DummyInput disabled />,
  },
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <FormFieldWrapper label="デフォルト">
        <DummyInput />
      </FormFieldWrapper>

      <FormFieldWrapper label="説明文付き" description="補足説明テキスト">
        <DummyInput />
      </FormFieldWrapper>

      <FormFieldWrapper label="必須項目" required>
        <DummyInput />
      </FormFieldWrapper>

      <FormFieldWrapper label="エラー状態" error="エラーメッセージ">
        <DummyInput />
      </FormFieldWrapper>

      <FormFieldWrapper label="全部入り" description="説明文付き" required error="エラーメッセージ">
        <DummyInput />
      </FormFieldWrapper>

      <FormFieldWrapper label="無効状態" description="この項目は変更できません" disabled>
        <DummyInput disabled />
      </FormFieldWrapper>
    </div>
  ),
}
