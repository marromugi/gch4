import { AddFill, ClipFill, DeleteFill, MoreVert, Photo, MovieFill } from '../../icon'
import { Button } from '../Button'
import { Menu } from './Menu'
import { MenuItem } from './MenuItem'
import { MenuSub } from './MenuSub'
import { MenuDivider } from './MenuDivider'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'メニューの表示位置',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'メニューの揃え位置',
    },
    minWidth: {
      control: 'number',
      description: 'メニューの最小幅（px）',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Menu>

export const Default: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">メニューを開く</Button>}>
      <MenuItem>新規作成</MenuItem>
      <MenuItem>編集</MenuItem>
      <MenuItem>コピー</MenuItem>
      <MenuDivider />
      <MenuItem>削除</MenuItem>
    </Menu>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary" icon={MoreVert} size="icon" />}>
      <MenuItem icon={Photo}>写真とファイルを追加</MenuItem>
      <MenuItem icon={MovieFill}>画像を作成する</MenuItem>
      <MenuItem icon={ClipFill}>Deep Research</MenuItem>
      <MenuDivider />
      <MenuItem icon={AddFill}>新規追加</MenuItem>
    </Menu>
  ),
}

export const WithDestructive: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">アクション</Button>}>
      <MenuItem icon={AddFill}>追加</MenuItem>
      <MenuItem>編集</MenuItem>
      <MenuDivider />
      <MenuItem icon={DeleteFill} destructive>
        削除
      </MenuItem>
    </Menu>
  ),
}

export const WithShortcuts: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">編集</Button>}>
      <MenuItem shortcut="⌘C">コピー</MenuItem>
      <MenuItem shortcut="⌘V">貼り付け</MenuItem>
      <MenuItem shortcut="⌘X">切り取り</MenuItem>
      <MenuDivider />
      <MenuItem shortcut="⌘Z">元に戻す</MenuItem>
      <MenuItem shortcut="⇧⌘Z">やり直す</MenuItem>
    </Menu>
  ),
}

export const WithSubmenu: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">オプション</Button>}>
      <MenuItem icon={Photo}>写真を追加</MenuItem>
      <MenuItem icon={MovieFill}>動画を追加</MenuItem>
      <MenuDivider />
      <MenuSub icon={AddFill} label="さらに表示">
        <MenuItem>オプション1</MenuItem>
        <MenuItem>オプション2</MenuItem>
        <MenuItem>オプション3</MenuItem>
      </MenuSub>
    </Menu>
  ),
}

export const NestedSubmenu: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">深いメニュー</Button>}>
      <MenuItem>アイテム1</MenuItem>
      <MenuSub label="サブメニュー1">
        <MenuItem>サブアイテム1-1</MenuItem>
        <MenuItem>サブアイテム1-2</MenuItem>
        <MenuSub label="さらにネスト">
          <MenuItem>ネストアイテム1</MenuItem>
          <MenuItem>ネストアイテム2</MenuItem>
        </MenuSub>
      </MenuSub>
      <MenuItem>アイテム2</MenuItem>
    </Menu>
  ),
}

export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
      <Menu
        placement="bottom"
        align="start"
        trigger={<Button variant="secondary">Bottom Start</Button>}
      >
        <MenuItem>アイテム1</MenuItem>
        <MenuItem>アイテム2</MenuItem>
      </Menu>
      <Menu
        placement="bottom"
        align="end"
        trigger={<Button variant="secondary">Bottom End</Button>}
      >
        <MenuItem>アイテム1</MenuItem>
        <MenuItem>アイテム2</MenuItem>
      </Menu>
      <Menu placement="top" align="start" trigger={<Button variant="secondary">Top Start</Button>}>
        <MenuItem>アイテム1</MenuItem>
        <MenuItem>アイテム2</MenuItem>
      </Menu>
      <Menu placement="top" align="end" trigger={<Button variant="secondary">Top End</Button>}>
        <MenuItem>アイテム1</MenuItem>
        <MenuItem>アイテム2</MenuItem>
      </Menu>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">無効なメニュー</Button>} disabled>
      <MenuItem>アイテム1</MenuItem>
      <MenuItem>アイテム2</MenuItem>
    </Menu>
  ),
}

export const DisabledItems: Story = {
  render: () => (
    <Menu trigger={<Button variant="secondary">一部無効</Button>}>
      <MenuItem>有効なアイテム</MenuItem>
      <MenuItem disabled>無効なアイテム</MenuItem>
      <MenuItem>有効なアイテム</MenuItem>
    </Menu>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-neutral-900 p-8 rounded-lg">
      <Menu trigger={<Button variant="secondary">ダークモード</Button>}>
        <MenuItem icon={Photo}>写真とファイルを追加</MenuItem>
        <MenuItem icon={MovieFill}>画像を作成する</MenuItem>
        <MenuItem icon={ClipFill}>Deep Research</MenuItem>
        <MenuDivider />
        <MenuSub icon={AddFill} label="さらに表示">
          <MenuItem>オプション1</MenuItem>
          <MenuItem>オプション2</MenuItem>
        </MenuSub>
        <MenuDivider />
        <MenuItem icon={DeleteFill} destructive>
          削除
        </MenuItem>
      </Menu>
    </div>
  ),
}
