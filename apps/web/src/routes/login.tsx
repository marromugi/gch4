import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/components/pages'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
