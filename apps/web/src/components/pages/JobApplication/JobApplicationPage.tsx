import { Typography } from '@ding/ui'
import { ChevronLeft } from '@ding/ui/icon'
import { cn } from '@ding/ui/lib'
import { Link } from '@tanstack/react-router'
import { ChatPanel } from './ChatPanel'
import { CompletionScreen } from './CompletionScreen'
import { ConsentCheck } from './ConsentCheck'
import { jobApplicationPage } from './const'
import { ExtractionReview } from './ExtractionReview'
import { useJobApplication } from './hook'
import { PreviewFormDataModal } from './PreviewFormDataModal'
import type { JobApplicationPageProps } from './type'

export function JobApplicationPage({
  applicationId,
  mode = 'live',
  jobId,
  jobTitle,
  className,
  backHref,
}: JobApplicationPageProps) {
  const styles = jobApplicationPage()
  const {
    phase,
    messages,
    todos,
    isSending,
    isComplete,
    isLoading,
    error,
    formData,
    formFieldLabels,
    handleSendMessage,
    handleReviewComplete,
    handleConsentComplete,
  } = useJobApplication(applicationId, mode, jobId)

  if (isLoading) {
    return (
      <div className={cn(styles.loadingState(), className)}>
        <div className={styles.spinner()} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(styles.loadingState(), className)}>
        <Typography variant="alert" size="sm">
          応募情報の取得に失敗しました
        </Typography>
      </div>
    )
  }

  return (
    <div className={cn(styles.container(), className)}>
      <div className={styles.header()}>
        {backHref && (
          <Link to={backHref} className={styles.backButton()}>
            <ChevronLeft width={20} height={20} />
          </Link>
        )}
        <Typography variant="body" size="md" weight="bold">
          {mode === 'preview' ? (jobTitle ?? '求人プレビュー') : '応募フォーム'}
        </Typography>
      </div>

      {phase === 'chat' && (
        <div className={styles.chatLayout()}>
          <div className={styles.chatArea()}>
            <ChatPanel
              messages={messages}
              isSending={isSending}
              isComplete={isComplete}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}

      {phase === 'review' && (
        <div className={styles.centerContent()}>
          <ExtractionReview todos={todos} onComplete={handleReviewComplete} />
        </div>
      )}

      {phase === 'consent' && mode === 'live' && (
        <div className={styles.centerContent()}>
          <ConsentCheck onComplete={handleConsentComplete} />
        </div>
      )}

      {phase === 'complete' && mode === 'live' && (
        <div className={styles.centerContent()}>
          <CompletionScreen applicationId={applicationId} />
        </div>
      )}

      {mode === 'preview' && isComplete && (
        <PreviewFormDataModal formData={formData} formFieldLabels={formFieldLabels} jobId={jobId} />
      )}
    </div>
  )
}
