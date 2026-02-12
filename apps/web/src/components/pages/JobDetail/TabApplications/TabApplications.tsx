import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { Link } from '@tanstack/react-router'
import { useJobApplications } from '../hook'
import { tabApplications } from './const'

interface TabApplicationsProps {
  jobId: string
}

export function TabApplications({ jobId }: TabApplicationsProps) {
  const styles = tabApplications()
  const { data: applications, isLoading } = useJobApplications(jobId, true)

  if (isLoading) {
    return (
      <Flex justify="center" className="py-8">
        <Typography variant="description">読み込み中...</Typography>
      </Flex>
    )
  }

  if (!applications || applications.length === 0) {
    return (
      <div className={styles.emptyState()}>
        <Typography variant="description">応募はまだありません</Typography>
      </div>
    )
  }

  return (
    <div className={styles.container()}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>応募者名</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>応募日時</TableHead>
            <TableHead>応募ページ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.applicantName || '未設定'}</TableCell>
              <TableCell>{app.applicantEmail || '-'}</TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell>
                {app.submittedAt ? new Date(app.submittedAt).toLocaleString('ja-JP') : '-'}
              </TableCell>
              <TableCell>
                <Link
                  to="/apply/$applicationId"
                  params={{ applicationId: app.id }}
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
