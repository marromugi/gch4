import { MockAuthProvider } from '@/lib/auth'
import { LoginPage } from './Login'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Pages/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MockAuthProvider>
        <Story />
      </MockAuthProvider>
    ),
  ],
} satisfies Meta<typeof LoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  decorators: [
    (Story) => (
      <MockAuthProvider value={{ isPending: true }}>
        <Story />
      </MockAuthProvider>
    ),
  ],
}
