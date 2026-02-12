import { Typography } from '@ding/ui'
import { completionScreen } from './const'

interface CompletionScreenProps {
  applicationId: string
}

export function CompletionScreen({ applicationId }: CompletionScreenProps) {
  const styles = completionScreen()

  return (
    <div className={styles.container()}>
      <div className={styles.icon()}>&#10003;</div>

      <Typography variant="body" size="lg" weight="bold" className={styles.title()}>
        応募が完了しました
      </Typography>

      <Typography variant="description" size="sm" as="p" className="mb-6">
        ご応募ありがとうございます。選考結果については、追ってご連絡いたします。
      </Typography>

      <Typography variant="description" size="xs" as="p" className="mb-2">
        応募 ID
      </Typography>
      <span className={styles.applicationId()}>{applicationId}</span>
    </div>
  )
}
