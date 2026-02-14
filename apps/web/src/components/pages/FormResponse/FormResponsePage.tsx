import { Typography } from '@ding/ui'
import { ChevronLeft } from '@ding/ui/icon'
import { cn } from '@ding/ui/lib'
import { Link } from '@tanstack/react-router'
import { ChatPanel } from './ChatPanel'
import { CompletionScreen } from './CompletionScreen'
import { ConsentCheck } from './ConsentCheck'
import { formResponsePage } from './const'
import { ExtractionReview } from './ExtractionReview'
import { useFormResponse } from './hook'
import { PreviewFormDataModal } from './PreviewFormDataModal'
import type { FormResponsePageProps } from './type'

export function FormResponsePage({
  submissionId,
  mode = 'live',
  formId,
  formTitle,
  className,
  backHref,
}: FormResponsePageProps) {
  const styles = formResponsePage()
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
  } = useFormResponse(submissionId, mode, formId)

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
          フォーム情報の取得に失敗しました
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
          {mode === 'preview' ? (formTitle ?? 'フォームプレビュー') : '回答フォーム'}
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
          <CompletionScreen submissionId={submissionId} />
        </div>
      )}

      {mode === 'preview' && isComplete && (
        <PreviewFormDataModal
          formData={formData}
          formFieldLabels={formFieldLabels}
          formId={formId}
        />
      )}
    </div>
  )
}
