import { CheckCircleFill, ErrorFill, MoreVert, Person, WarningFill } from '../../icon'
import { Table } from './Table'
import { TableBody } from './TableBody'
import { TableCaption } from './TableCaption'
import { TableCell } from './TableCell'
import { TableFooter } from './TableFooter'
import { TableHead } from './TableHead'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'striped'],
      description: 'テーブルのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'テーブルのサイズ',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', maxWidth: '800px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Table>

// サンプルデータ
const invoices = [
  { id: 'INV001', status: '支払済み', method: 'クレジットカード', amount: '¥25,000' },
  { id: 'INV002', status: '保留中', method: '銀行振込', amount: '¥15,000' },
  { id: 'INV003', status: '未払い', method: 'クレジットカード', amount: '¥35,000' },
  { id: 'INV004', status: '支払済み', method: 'PayPal', amount: '¥45,000' },
  { id: 'INV005', status: '支払済み', method: 'クレジットカード', amount: '¥55,000' },
]

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>請求書ID</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>支払方法</TableHead>
          <TableHead className="text-right">金額</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Striped: Story = {
  render: () => (
    <Table variant="striped">
      <TableHeader>
        <TableRow>
          <TableHead>請求書ID</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>支払方法</TableHead>
          <TableHead className="text-right">金額</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>最近の請求書一覧</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>請求書ID</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>支払方法</TableHead>
          <TableHead className="text-right">金額</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>請求書ID</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>支払方法</TableHead>
          <TableHead className="text-right">金額</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>合計</TableCell>
          <TableCell className="text-right font-bold">¥175,000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Small</p>
        <Table size="sm">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>名前</TableHead>
              <TableHead>ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>001</TableCell>
              <TableCell>田中太郎</TableCell>
              <TableCell>アクティブ</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>002</TableCell>
              <TableCell>山田花子</TableCell>
              <TableCell>保留中</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Medium (default)
        </p>
        <Table size="md">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>名前</TableHead>
              <TableHead>ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>001</TableCell>
              <TableCell>田中太郎</TableCell>
              <TableCell>アクティブ</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>002</TableCell>
              <TableCell>山田花子</TableCell>
              <TableCell>保留中</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Large</p>
        <Table size="lg">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>名前</TableHead>
              <TableHead>ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>001</TableCell>
              <TableCell>田中太郎</TableCell>
              <TableCell>アクティブ</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>002</TableCell>
              <TableCell>山田花子</TableCell>
              <TableCell>保留中</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  ),
}

export const WithSelectedRow: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>名前</TableHead>
          <TableHead>ステータス</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>001</TableCell>
          <TableCell>田中太郎</TableCell>
          <TableCell>アクティブ</TableCell>
        </TableRow>
        <TableRow selected>
          <TableCell>002</TableCell>
          <TableCell>山田花子（選択中）</TableCell>
          <TableCell>保留中</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>003</TableCell>
          <TableCell>佐藤次郎</TableCell>
          <TableCell>非アクティブ</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

// アイコン付きサンプルデータ
const users = [
  { id: '001', name: '田中太郎', email: 'tanaka@example.com', status: 'active' },
  { id: '002', name: '山田花子', email: 'yamada@example.com', status: 'pending' },
  { id: '003', name: '佐藤次郎', email: 'sato@example.com', status: 'inactive' },
]

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'active':
      return <CheckCircleFill className="size-4 text-green-500" />
    case 'pending':
      return <WarningFill className="size-4 text-yellow-500" />
    case 'inactive':
      return <ErrorFill className="size-4 text-red-500" />
    default:
      return null
  }
}

const statusLabel = {
  active: 'アクティブ',
  pending: '保留中',
  inactive: '非アクティブ',
}

export const WithIcons: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ユーザー</TableHead>
          <TableHead>メール</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Person className="size-5 text-neutral-400" />
                <span className="font-medium">{user.name}</span>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <StatusIcon status={user.status} />
                <span>{statusLabel[user.status as keyof typeof statusLabel]}</span>
              </div>
            </TableCell>
            <TableCell>
              <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                <MoreVert className="size-4 text-neutral-500" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
