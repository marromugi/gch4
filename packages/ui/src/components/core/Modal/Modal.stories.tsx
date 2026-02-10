import { useState } from 'react'
import { Button } from '../Button'
import { Modal } from './Modal'
import { ModalBody } from './ModalBody'
import { ModalFooter } from './ModalFooter'
import { ModalHeader } from './ModalHeader'
import type { ModalSize } from './type'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'モーダルのサイズ',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'オーバーレイクリックで閉じるか',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Escapeキーで閉じるか',
    },
    showCloseButton: {
      control: 'boolean',
      description: '閉じるボタンを表示するか',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '400px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Modal>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>モーダルを開く</Button>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalHeader>確認</ModalHeader>
          <ModalBody>
            <p>この操作を実行しますか？</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={() => setOpen(false)}>確認</Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<ModalSize | null>(null)
    return (
      <div className="flex gap-2">
        {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((s) => (
          <Button key={s} variant="secondary" onClick={() => setSize(s)}>
            {s.toUpperCase()}
          </Button>
        ))}
        <Modal open={size !== null} onOpenChange={() => setSize(null)} size={size ?? 'md'}>
          <ModalHeader>サイズ: {size?.toUpperCase()}</ModalHeader>
          <ModalBody>
            <p>このモーダルは {size} サイズです。</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setSize(null)}>閉じる</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  },
}

export const WithLongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>長いコンテンツ</Button>
        <Modal open={open} onOpenChange={setOpen} size="md">
          <ModalHeader>利用規約</ModalHeader>
          <ModalBody>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} className="mb-4">
                これは長いコンテンツの段落 {i + 1}{' '}
                です。スクロール可能であることを確認してください。
              </p>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={() => setOpen(false)}>同意する</Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

export const WithoutCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>閉じるボタンなし</Button>
        <Modal open={open} onOpenChange={setOpen} showCloseButton={false}>
          <ModalHeader>閉じるボタンなし</ModalHeader>
          <ModalBody>
            <p>閉じるボタンは非表示です。フッターのボタンで閉じてください。</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setOpen(false)}>閉じる</Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

export const PreventClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>閉じにくいモーダル</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          closeOnOverlayClick={false}
          closeOnEscape={false}
          showCloseButton={false}
        >
          <ModalHeader>確認必須</ModalHeader>
          <ModalBody>
            <p>このモーダルはボタンでのみ閉じることができます。</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setOpen(false)}>理解しました</Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

export const DarkMode: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="dark bg-neutral-900 p-8 rounded-lg">
        <Button onClick={() => setOpen(true)}>ダークモード</Button>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalHeader>ダークモード</ModalHeader>
          <ModalBody>
            <p className="text-neutral-200">ダークモードでの表示です。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={() => setOpen(false)}>確認</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  },
}

export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="alert" onClick={() => setOpen(true)}>
          削除
        </Button>
        <Modal open={open} onOpenChange={setOpen} size="sm">
          <ModalHeader>削除の確認</ModalHeader>
          <ModalBody>
            <p>この項目を削除しますか？この操作は取り消せません。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button variant="alert" onClick={() => setOpen(false)}>
              削除
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}
