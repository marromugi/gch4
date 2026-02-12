import { Button, Typography } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { useRouter } from '@tanstack/react-router'
import { previewComplete } from './const'

interface PreviewCompleteProps {
  jobId?: string
}

export function PreviewComplete({ jobId }: PreviewCompleteProps) {
  const styles = previewComplete()
  const router = useRouter()

  return (
    <div className={styles.container()}>
      <div className={styles.icon()}>&#10003;</div>

      <Typography variant="body" size="lg" weight="bold" className={styles.title()}>
        プレビュー完了
      </Typography>

      <Typography variant="description" size="sm" as="p" className="mb-6">
        チャットフローと抽出結果の確認が完了しました。実際の応募では、この後に同意チェックと応募送信が行われます。
      </Typography>

      {jobId && (
        <Flex justify="center">
          <Button
            variant="secondary"
            onClick={() =>
              router.navigate({
                to: '/jobs/$jobId',
                params: { jobId },
              })
            }
          >
            求人詳細に戻る
          </Button>
        </Flex>
      )}
    </div>
  )
}
