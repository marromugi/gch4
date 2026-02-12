import { Box, Button, Typography, useToast } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { useJobSchema, useApproveSchemaVersionMutation } from '../hook'
import { tabSchema } from './const'
import type { JobFormField } from '../type'

interface TabSchemaProps {
  jobId: string
  isDraft: boolean
  formFields: JobFormField[]
}

export function TabSchema({ jobId, isDraft, formFields }: TabSchemaProps) {
  const styles = tabSchema()
  const { data: schemaData, isLoading } = useJobSchema(jobId, true)
  const { mutate: approveSchema, isPending } = useApproveSchemaVersionMutation(jobId)
  const toast = useToast()

  if (isLoading) {
    return (
      <Flex justify="center" className="py-8">
        <Typography variant="description">読み込み中...</Typography>
      </Flex>
    )
  }

  if (!schemaData) {
    return <Typography variant="description">スキーマ情報がありません</Typography>
  }

  const { schemaVersion, factDefinitions, prohibitedTopics } = schemaData

  const handleApprove = () => {
    approveSchema(
      { jobId, data: { schemaVersionId: schemaVersion.id } },
      {
        onSuccess: () => {
          toast.success('スキーマを承認しました')
        },
        onError: (error) => {
          toast.error((error as unknown as Error).message || 'スキーマの承認に失敗しました')
        },
      }
    )
  }

  const fieldMap = new Map(formFields.map((f) => [f.id, f]))

  const groupedDefinitions = new Map<string, typeof factDefinitions>()
  for (const def of factDefinitions) {
    const existing = groupedDefinitions.get(def.jobFormFieldId) ?? []
    existing.push(def)
    groupedDefinitions.set(def.jobFormFieldId, existing)
  }

  const groupedTopics = new Map<string, typeof prohibitedTopics>()
  for (const topic of prohibitedTopics) {
    const existing = groupedTopics.get(topic.jobFormFieldId) ?? []
    existing.push(topic)
    groupedTopics.set(topic.jobFormFieldId, existing)
  }

  const allFieldIds = new Set([...groupedDefinitions.keys(), ...groupedTopics.keys()])

  return (
    <div className={styles.container()}>
      <Box background="surface" border="muted" className={styles.versionInfo()}>
        <Flex direction="column" gap={2}>
          <Flex gap={4}>
            <div>
              <Typography variant="description" size="sm">
                バージョン
              </Typography>
              <Typography variant="body" size="md" weight="medium">
                v{schemaVersion.version}
              </Typography>
            </div>
            <div>
              <Typography variant="description" size="sm">
                ステータス
              </Typography>
              <Typography variant="body" size="md" weight="medium">
                {schemaVersion.status === 'approved' ? '承認済み' : '下書き'}
              </Typography>
            </div>
            {schemaVersion.approvedAt && (
              <div>
                <Typography variant="description" size="sm">
                  承認日時
                </Typography>
                <Typography variant="body" size="md">
                  {new Date(schemaVersion.approvedAt).toLocaleString('ja-JP')}
                </Typography>
              </div>
            )}
          </Flex>
        </Flex>
      </Box>

      {allFieldIds.size > 0 ? (
        Array.from(allFieldIds).map((fieldId) => {
          const field = fieldMap.get(fieldId)
          const definitions = groupedDefinitions.get(fieldId) ?? []
          const topics = groupedTopics.get(fieldId) ?? []

          return (
            <Box key={fieldId} background="surface" border="muted" className={styles.fieldGroup()}>
              <Typography
                variant="body"
                size="md"
                weight="semibold"
                className={styles.fieldGroupTitle()}
              >
                {field?.label ?? fieldId}
              </Typography>

              {definitions.length > 0 && (
                <div className="mb-3">
                  <Typography variant="description" size="sm" weight="medium" className="mb-1">
                    FactDefinitions
                  </Typography>
                  {definitions
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((def) => (
                      <div key={def.id} className={styles.definitionItem()}>
                        <Typography variant="body" size="sm" weight="medium">
                          {def.factKey}
                        </Typography>
                        <Typography variant="description" size="sm">
                          {def.fact}
                        </Typography>
                        <Typography variant="description" size="xs">
                          完了基準: {def.doneCriteria}
                        </Typography>
                      </div>
                    ))}
                </div>
              )}

              {topics.length > 0 && (
                <div>
                  <Typography variant="description" size="sm" weight="medium" className="mb-1">
                    ProhibitedTopics
                  </Typography>
                  {topics.map((topic) => (
                    <div key={topic.id} className={styles.topicItem()}>
                      <Typography variant="body" size="sm">
                        {topic.topic}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}
            </Box>
          )
        })
      ) : (
        <Typography variant="description">スキーマ定義がまだありません</Typography>
      )}

      {isDraft && schemaVersion.status === 'draft' && (
        <div className={styles.approveButton()}>
          <Button variant="primary" onClick={handleApprove} disabled={isPending}>
            {isPending ? '承認中...' : 'スキーマを承認する'}
          </Button>
        </div>
      )}
    </div>
  )
}
