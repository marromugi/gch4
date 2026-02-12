import { Button, Checkbox, Typography } from '@ding/ui'
import { useCallback, useState } from 'react'
import { consentCheck } from './const'

interface ConsentCheckProps {
  onComplete: () => Promise<void>
}

export function ConsentCheck({ onComplete }: ConsentCheckProps) {
  const styles = consentCheck()
  const [dataUsage, setDataUsage] = useState(false)
  const [privacyPolicy, setPrivacyPolicy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allChecked = dataUsage && privacyPolicy

  const handleSubmit = useCallback(async () => {
    if (!allChecked) return
    setIsSubmitting(true)
    try {
      await onComplete()
    } finally {
      setIsSubmitting(false)
    }
  }, [allChecked, onComplete])

  return (
    <div className={styles.container()}>
      <Typography variant="body" size="lg" weight="bold" className={styles.title()}>
        同意事項の確認
      </Typography>

      <Typography variant="description" size="sm" as="p" className={styles.description()}>
        応募を確定する前に、以下の同意事項をご確認ください。
      </Typography>

      <div className={styles.checkboxGroup()}>
        <div className={styles.checkboxItem()}>
          <Checkbox
            checked={dataUsage}
            onCheckedChange={setDataUsage}
            label="入力いただいた情報を選考目的で利用することに同意します。"
          />
        </div>

        <div className={styles.checkboxItem()}>
          <Checkbox
            checked={privacyPolicy}
            onCheckedChange={setPrivacyPolicy}
            label="プライバシーポリシーに同意します。"
          />
        </div>
      </div>

      <div className={styles.actions()}>
        <Button variant="primary" onClick={handleSubmit} disabled={!allChecked || isSubmitting}>
          応募を確定する
        </Button>
      </div>
    </div>
  )
}
