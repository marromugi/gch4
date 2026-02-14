import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { cn } from '@ding/ui/lib'
import { useRouter } from '@tanstack/react-router'
import { formListPage } from './const'
import { useForms } from './hook'
import type { FormListPageProps } from './type'

export function FormListPage({ className }: FormListPageProps) {
  const styles = formListPage()
  const { data: forms, isLoading, error } = useForms()
  const router = useRouter()

  if (isLoading) {
    return (
      <Box className={cn(styles.container(), className)}>
        <div className={styles.loadingState()}>
          <div className={styles.spinner()} />
        </div>
      </Box>
    )
  }

  if (error) {
    return (
      <Box className={cn(styles.container(), className)}>
        <div className={styles.emptyState()}>
          <p className={styles.emptyMessage()}>エラーが発生しました</p>
        </div>
      </Box>
    )
  }

  return (
    <Box className={cn(styles.container(), className)}>
      <Flex className={styles.header()} justify={'between'} align={'center'}>
        <Typography className={styles.title()}>フォーム</Typography>
        <Button variant="primary" onClick={() => router.navigate({ to: '/forms/create' })}>
          フォームを作成
        </Button>
      </Flex>

      {forms && forms.length > 0 ? (
        <div className={styles.tableWrapper()}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>フォーム名</TableHead>
                <TableHead className="text-right">回答数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow
                  key={form.id}
                  className="cursor-pointer"
                  onClick={() =>
                    router.navigate({ to: '/forms/$formId', params: { formId: form.id } })
                  }
                >
                  <TableCell className="font-medium">{form.title}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className={styles.emptyState()}>
          <p className={styles.emptyMessage()}>フォームがありません</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.navigate({ to: '/forms/create' })}
          >
            最初のフォームを作成
          </Button>
        </div>
      )}
    </Box>
  )
}
