import { Typography } from '@ding/ui'
import { cn } from '@ding/ui/lib'
import { ChatPanel } from './ChatPanel'
import { CompletionScreen } from './CompletionScreen'
import { ConsentCheck } from './ConsentCheck'
import { jobApplicationPage } from './const'
import { ExtractionReview } from './ExtractionReview'
import { useJobApplication } from './hook'
import { PreviewComplete } from './PreviewComplete'
import { TodoProgress } from './TodoProgress'
import type { JobApplicationPageProps } from './type'

export function JobApplicationPage({
  applicationId,
  mode = 'live',
  jobId,
  className,
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
    handleSendMessage,
    handleReviewComplete,
    handleConsentComplete,
  } = useJobApplication(applicationId, mode)

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
        <Typography variant="body" size="md" weight="bold">
          {mode === 'preview' ? 'チャットプレビュー' : '応募フォーム'}
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
          <div className={styles.sidebar()}>
            <TodoProgress todos={todos} />
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

      {phase === 'complete' && (
        <div className={styles.centerContent()}>
          {mode === 'preview' ? (
            <PreviewComplete jobId={jobId} />
          ) : (
            <CompletionScreen applicationId={applicationId} />
          )}
        </div>
      )}
    </div>
  )
}
