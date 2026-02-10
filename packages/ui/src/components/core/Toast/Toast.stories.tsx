import { Button } from '../Button'
import { ToastProvider } from './ToastProvider'
import { useToast } from './hooks'
import type { ToastPosition } from './type'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <div style={{ minHeight: '400px', padding: '20px' }}>
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
}

export default meta

const ToastDemo = () => {
  const { success, error, warning, info, addToast } = useToast()

  return (
    <div className="flex flex-wrap gap-4">
      <Button onClick={() => success('操作が成功しました')}>Success</Button>
      <Button onClick={() => error('エラーが発生しました')}>Error</Button>
      <Button onClick={() => warning('注意が必要です')}>Warning</Button>
      <Button onClick={() => info('お知らせです')}>Info</Button>
      <Button
        variant="secondary"
        onClick={() =>
          addToast({
            type: 'success',
            title: 'タイトルとメッセージ',
            message: 'サブテキストも表示できます',
          })
        }
      >
        With Message
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          addToast({
            title: 'このToastは自動で消えません',
            duration: 0,
          })
        }
      >
        No Auto Close
      </Button>
    </div>
  )
}

export const Default: StoryObj = {
  render: () => <ToastDemo />,
}

export const AllTypes: StoryObj = {
  render: () => {
    const AllTypesInner = () => {
      const { success, error, warning, info, addToast } = useToast()

      const showAll = () => {
        success('成功')
        setTimeout(() => error('エラー'), 200)
        setTimeout(() => warning('警告'), 400)
        setTimeout(() => info('情報'), 600)
        setTimeout(() => addToast({ title: 'デフォルト' }), 800)
      }

      return <Button onClick={showAll}>全タイプを表示</Button>
    }

    return <AllTypesInner />
  },
}

const PositionDemoInner = ({ position }: { position: ToastPosition }) => {
  const { success } = useToast()
  return (
    <Button variant="secondary" onClick={() => success(`位置: ${position}`)}>
      {position}
    </Button>
  )
}

const PositionDemo = ({ position }: { position: ToastPosition }) => {
  return (
    <ToastProvider position={position}>
      <PositionDemoInner position={position} />
    </ToastProvider>
  )
}

export const Positions: StoryObj = {
  render: () => {
    const positions: ToastPosition[] = [
      'top-right',
      'top-left',
      'top-center',
      'bottom-right',
      'bottom-left',
      'bottom-center',
    ]

    return (
      <div className="flex flex-wrap gap-4">
        {positions.map((pos) => (
          <PositionDemo key={pos} position={pos} />
        ))}
      </div>
    )
  },
  decorators: [(Story) => <Story />],
}

export const DarkMode: StoryObj = {
  render: () => (
    <div className="dark bg-neutral-900 p-8 rounded-lg">
      <ToastDemo />
    </div>
  ),
}

export const CustomDuration: StoryObj = {
  render: () => {
    const CustomDurationInner = () => {
      const { addToast } = useToast()

      return (
        <div className="flex gap-4">
          <Button
            onClick={() => addToast({ title: '2秒で消えます', duration: 2000, type: 'info' })}
          >
            2秒
          </Button>
          <Button
            onClick={() => addToast({ title: '10秒で消えます', duration: 10000, type: 'info' })}
          >
            10秒
          </Button>
          <Button onClick={() => addToast({ title: '消えません', duration: 0, type: 'warning' })}>
            自動消去なし
          </Button>
        </div>
      )
    }

    return <CustomDurationInner />
  },
}

export const WithMessage: StoryObj = {
  render: () => {
    const WithMessageInner = () => {
      const { success, error } = useToast()

      return (
        <div className="flex gap-4">
          <Button
            onClick={() => success('保存完了', { message: 'ファイルが正常に保存されました' })}
          >
            成功（メッセージ付き）
          </Button>
          <Button
            onClick={() => error('接続エラー', { message: 'ネットワーク接続を確認してください' })}
          >
            エラー（メッセージ付き）
          </Button>
        </div>
      )
    }

    return <WithMessageInner />
  },
}

export const StackLimit: StoryObj = {
  render: () => {
    const StackLimitInner = () => {
      const { addToast } = useToast()
      let count = 0

      const addMultiple = () => {
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            count++
            addToast({ title: `Toast #${count}`, type: 'info' })
          }, i * 100)
        }
      }

      return <Button onClick={addMultiple}>8個のToastを追加（最大5個表示）</Button>
    }

    return <StackLimitInner />
  },
}
