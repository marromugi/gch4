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
import { jobListPage } from './const'
import { useJobs } from './hook'
import type { JobListPageProps } from './type'

export function JobListPage({ className }: JobListPageProps) {
  const styles = jobListPage()
  const { data: jobs, isLoading, error } = useJobs()
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
        <Typography className={styles.title()}>求人</Typography>
        <Button variant="primary" onClick={() => router.navigate({ to: '/jobs/create' })}>
          求人を作成
        </Button>
      </Flex>

      {jobs && jobs.length > 0 ? (
        <div className={styles.tableWrapper()}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>求人名</TableHead>
                <TableHead className="text-right">応募者数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="cursor-pointer"
                  onClick={() => router.navigate({ to: '/jobs/$jobId', params: { jobId: job.id } })}
                >
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className={styles.emptyState()}>
          <p className={styles.emptyMessage()}>求人がありません</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.navigate({ to: '/jobs/create' })}
          >
            最初の求人を作成
          </Button>
        </div>
      )}
    </Box>
  )
}
