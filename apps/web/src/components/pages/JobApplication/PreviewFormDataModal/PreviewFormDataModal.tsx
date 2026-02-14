import { Button, Modal, ModalBody, ModalHeader, Typography } from '@ding/ui'
import { useRouter } from '@tanstack/react-router'
import { previewFormDataModal } from './const'

interface PreviewFormDataModalProps {
  formData: Record<string, string> | null
  formFieldLabels: Record<string, string>
  jobId?: string
}

export function PreviewFormDataModal({
  formData,
  formFieldLabels,
  jobId,
}: PreviewFormDataModalProps) {
  const router = useRouter()
  const styles = previewFormDataModal()

  const handleBackToJob = () => {
    if (jobId) {
      router.navigate({ to: '/jobs/$jobId', params: { jobId } })
    }
  }

  return (
    <Modal open={true} onOpenChange={() => {}} showCloseButton={false} size="md">
      <ModalHeader>収集されたデータ</ModalHeader>
      <ModalBody>
        {formData && Object.keys(formData).length > 0 ? (
          <dl className={styles.dataList()}>
            {Object.entries(formData).map(([fieldId, value]) => (
              <div key={fieldId} className={styles.dataItem()}>
                <dt className={styles.label()}>
                  <Typography size={'xs'} variant={'description'}>
                    {formFieldLabels[fieldId] ?? fieldId}
                  </Typography>
                </dt>
                <dd className={styles.value()}>
                  <Typography size={'sm'}>{value}</Typography>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <Typography variant="description" size="sm">
            データがありません
          </Typography>
        )}

        {jobId && (
          <div className={styles.buttonContainer()}>
            <Button variant="secondary" onClick={handleBackToJob} className="w-full">
              求人ページに戻る
            </Button>
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}
