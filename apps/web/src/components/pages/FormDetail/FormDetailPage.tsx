import { Box, Button, Tab, Typography } from '@ding/ui'
import { cn } from '@ding/ui/lib'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { formDetailPage } from './const'
import { FormDetailHeader } from './FormDetailHeader'
import { useFormDetail, useFormSubmissions } from './hook'
import { TabBasicInfo } from './TabBasicInfo'
import { TabFormFields } from './TabFormFields'
import { TabSubmissions } from './TabSubmissions'
import type { FormDetailPageProps } from './type'
import type { TabItem } from '@ding/ui'

const DRAFT_TABS: TabItem[] = [
  { value: 'basic', label: '基本情報' },
  { value: 'form-fields', label: 'フォーム項目' },
]

const ACTIVE_TABS: TabItem[] = [
  { value: 'basic', label: '基本情報' },
  { value: 'form-fields', label: 'フォーム項目' },
  { value: 'submissions', label: '回答一覧' },
]

export function FormDetailPage({ formId, className }: FormDetailPageProps) {
  const styles = formDetailPage()
  const [activeTab, setActiveTab] = useState('basic')
  const { data: form, isLoading, error } = useFormDetail(formId)
  const router = useRouter()

  const isDraft = form?.status === 'draft'
  const isPublishedOrClosed = form?.status === 'published' || form?.status === 'closed'

  const { data: submissions = [] } = useFormSubmissions(formId, !!form)

  const tabs = isPublishedOrClosed ? ACTIVE_TABS : DRAFT_TABS

  if (isLoading) {
    return (
      <Box className={cn(styles.container(), className)}>
        <div className={styles.loadingState()}>
          <div className={styles.spinner()} />
        </div>
      </Box>
    )
  }

  if (error || !form) {
    return (
      <Box className={cn(styles.container(), className)}>
        <div className={styles.emptyState()}>
          <Typography variant="description" className={styles.emptyMessage()}>
            フォームが見つかりません
          </Typography>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.navigate({ to: '/forms' })}
          >
            フォーム一覧に戻る
          </Button>
        </div>
      </Box>
    )
  }

  return (
    <Box className={cn(styles.container(), className)}>
      <div className={styles.header()}>
        <FormDetailHeader form={form} />
      </div>

      <div className={styles.tabWrapper()}>
        <Tab items={tabs} value={activeTab} onChange={setActiveTab} />
      </div>

      <div className={styles.tabContent()}>
        {activeTab === 'basic' && (
          <TabBasicInfo form={form} isDraft={isDraft} submissionCount={submissions.length} />
        )}
        {activeTab === 'form-fields' && <TabFormFields formId={formId} isDraft={isDraft} />}
        {activeTab === 'submissions' && isPublishedOrClosed && <TabSubmissions formId={formId} />}
      </div>
    </Box>
  )
}
