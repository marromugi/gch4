import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/forms/$formId')({
  component: () => <Outlet />,
})
