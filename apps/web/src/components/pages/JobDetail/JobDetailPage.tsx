import { Box, Button, Tab, Typography } from '@ding/ui'
import { cn } from '@ding/ui/lib'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { jobDetailPage } from './const'
import { useJobDetail, useJobFormFields, useJobSchema } from './hook'
import { JobDetailHeader } from './JobDetailHeader'
import { TabApplications } from './TabApplications'
import { TabBasicInfo } from './TabBasicInfo'
import { TabFormFields } from './TabFormFields'
import { TabSchema } from './TabSchema'
import type { JobDetailPageProps } from './type'
import type { TabItem } from '@ding/ui'

interface Props extends JobDetailPageProps {
  jobId: string
}

const DRAFT_TABS: TabItem[] = [
  { value: 'basic', label: '基本情報' },
  { value: 'form-fields', label: 'フォーム項目' },
  { value: 'schema', label: 'スキーマ定義' },
]

const ACTIVE_TABS: TabItem[] = [
  { value: 'basic', label: '基本情報' },
  { value: 'form-fields', label: 'フォーム項目' },
  { value: 'schema', label: 'スキーマ定義' },
  { value: 'applications', label: '応募一覧' },
]

export function JobDetailPage({ jobId, className }: Props) {
  const styles = jobDetailPage()
  const [activeTab, setActiveTab] = useState('basic')
  const { data: job, isLoading, error } = useJobDetail(jobId)
  const router = useRouter()

  const isDraft = job?.status === 'draft'
  const isOpenOrClosed = job?.status === 'open' || job?.status === 'closed'

  const { data: formFields = [] } = useJobFormFields(jobId, !!job)
  const { data: schemaData } = useJobSchema(jobId, !!job)

  const isSchemaApproved = schemaData?.schemaVersion?.status === 'approved'

  const tabs = isOpenOrClosed ? ACTIVE_TABS : DRAFT_TABS

  if (isLoading) {
    return (
      <Box className={cn(styles.container(), className)}>
        <div className={styles.loadingState()}>
          <div className={styles.spinner()} />
        </div>
      </Box>
    )
  }

  if (error || !job) {
    return (
      <Box className={cn(styles.container(), className)}>
        <div className={styles.emptyState()}>
          <Typography variant="description" className={styles.emptyMessage()}>
            求人が見つかりません
          </Typography>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.navigate({ to: '/jobs' })}
          >
            求人一覧に戻る
          </Button>
        </div>
      </Box>
    )
  }

  return (
    <Box className={cn(styles.container(), className)}>
      <div className={styles.header()}>
        <JobDetailHeader job={job} isSchemaApproved={isSchemaApproved} />
      </div>

      <div className={styles.tabWrapper()}>
        <Tab items={tabs} value={activeTab} onChange={setActiveTab} />
      </div>

      <div className={styles.tabContent()}>
        {activeTab === 'basic' && <TabBasicInfo job={job} isDraft={isDraft} />}
        {activeTab === 'form-fields' && <TabFormFields jobId={jobId} isDraft={isDraft} />}
        {activeTab === 'schema' && (
          <TabSchema jobId={jobId} isDraft={isDraft} formFields={formFields} />
        )}
        {activeTab === 'applications' && isOpenOrClosed && <TabApplications jobId={jobId} />}
      </div>
    </Box>
  )
}
