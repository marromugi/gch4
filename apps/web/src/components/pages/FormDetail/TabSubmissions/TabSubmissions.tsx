import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { Link } from '@tanstack/react-router'
import { useFormSubmissions } from '../hook'
import { tabSubmissions } from './const'

interface TabSubmissionsProps {
  formId: string
}

export function TabSubmissions({ formId }: TabSubmissionsProps) {
  const styles = tabSubmissions()
  const { data: submissions, isLoading } = useFormSubmissions(formId, true)

  if (isLoading) {
    return (
      <Flex justify="center" className="py-8">
        <Typography variant="description">読み込み中...</Typography>
      </Flex>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className={styles.emptyState()}>
        <Typography variant="description">回答はまだありません</Typography>
      </div>
    )
  }

  return (
    <div className={styles.container()}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>回答者名</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>回答日時</TableHead>
            <TableHead>回答ページ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-medium">{sub.respondentName || '未設定'}</TableCell>
              <TableCell>{sub.respondentEmail || '-'}</TableCell>
              <TableCell>{sub.status}</TableCell>
              <TableCell>
                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('ja-JP') : '-'}
              </TableCell>
              <TableCell>
                <Link
                  to="/respond/$submissionId"
                  params={{ submissionId: sub.id }}
                  className={styles.link()}
                >
                  開く
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
