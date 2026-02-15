import { Typography } from '@ding/ui'
import { ChevronLeft } from '@ding/ui/icon'
import { cn } from '@ding/ui/lib'
import { Link } from '@tanstack/react-router'
import { ChatBubble } from '@/components/common/ChatBubble'
import { useGetFormFields } from '@/lib/api/generated/form/form'
import { ChatPanel } from './ChatPanel'
import { formResponsePage } from './const'
import { FallbackForm } from './FallbackForm'
import { useFormResponseV3, type V3ChatMessage } from './hookV3'
import { PreviewFormDataModal } from './PreviewFormDataModal'
import type { ChatMessage } from './type'
import type { OrchestratorStage } from '@/lib/api/v3'

const STAGE_LABELS: Record<OrchestratorStage, string> = {
  BOOTSTRAP: '準備中',
  INTERVIEW_LOOP: 'ヒアリング中',
  FINAL_AUDIT: '最終確認',
  COMPLETED: '完了',
}

export interface FormResponseV3PageProps {
  formId: string
  formTitle?: string
  className?: string
  backHref?: string
}

/**
 * V3 API を使用したフォームレスポンスページ
 *
 * プレビュー専用。Submission を作成せず、formId のみで V3 セッションを開始する。
 */
export function FormResponseV3Page({
  formId,
  formTitle,
  className,
  backHref,
}: FormResponseV3PageProps) {
  const styles = formResponsePage()
  const {
    messages,
    isSending,
    isComplete,
    isLoading,
    error,
    formData,
    formFieldLabels,
    currentStage,
    currentAskOptions,
    handleSendMessage,
    handleOptionSubmit,
    isFallbackMode,
    fallbackCollectedFields,
    fallbackRemainingFieldIds,
    handleFallbackSubmit,
  } = useFormResponseV3(formId)

  // フォームフィールド取得（フォールバック用）
  const { data: formFieldsData } = useGetFormFields(formId, {
    query: { enabled: !!formId },
  })
  const formFields = formFieldsData?.data ?? []

  // V3ChatMessage を ChatMessage 形式に変換（ChatPanel との互換性のため）
  const chatMessages: ChatMessage[] = messages.map((m: V3ChatMessage) => ({
    id: m.id,
    chatSessionId: '',
    role: m.role,
    content: m.content,
    targetFormFieldId: null,
    reviewPassed: null,
    createdAt: m.createdAt,
  }))

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
          セッションの作成に失敗しました: {error.message}
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
        <div className="flex items-center gap-2">
          <Typography variant="body" size="md" weight="bold">
            {formTitle ?? 'フォームプレビュー'}
          </Typography>
          {currentStage && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {STAGE_LABELS[currentStage]}
            </span>
          )}
        </div>
      </div>

      <div className={styles.chatLayout()}>
        <div className={styles.chatArea()}>
          {isFallbackMode ? (
            <>
              {/* フォールバックモード: チャット履歴 + フォーム */}
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                {chatMessages.map((msg) => (
                  <ChatBubble key={msg.id} content={msg.content} role={msg.role} />
                ))}

                <FallbackForm
                  formFields={formFields}
                  collectedFields={fallbackCollectedFields}
                  remainingFieldIds={fallbackRemainingFieldIds}
                  onSubmit={handleFallbackSubmit}
                  isSubmitting={isSending}
                />
              </div>
            </>
          ) : (
            <ChatPanel
              messages={chatMessages}
              isSending={isSending}
              isComplete={isComplete}
              onSendMessage={handleSendMessage}
              askOptions={currentAskOptions}
              onOptionSubmit={handleOptionSubmit}
            />
          )}
        </div>
      </div>

      {isComplete && (
        <PreviewFormDataModal
          formData={formData}
          formFieldLabels={formFieldLabels}
          formId={formId}
        />
      )}
    </div>
  )
}
