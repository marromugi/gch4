import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold">Ding</h1>
      <p className="mt-4 text-muted-foreground">
        カジュアル面談の前後情報をLLMとのチャットで構造化
      </p>
    </div>
  )
}
