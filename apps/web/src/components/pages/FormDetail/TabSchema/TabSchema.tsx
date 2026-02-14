import { Box, Button, Typography, useToast } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { useFormSchema, useApproveSchemaVersionMutation } from '../hook'
import { tabSchema } from './const'
import type { FormField, FieldCompletionCriteria } from '../type'

interface TabSchemaProps {
  formId: string
  isDraft: boolean
  formFields: FormField[]
}

export function TabSchema({ formId, isDraft, formFields }: TabSchemaProps) {
  const styles = tabSchema()
  const { data: schemaData, isLoading } = useFormSchema(formId, true)
  const { mutate: approveSchema, isPending } = useApproveSchemaVersionMutation(formId)
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

  const { schemaVersion, completionCriteria } = schemaData

  const handleApprove = () => {
    approveSchema(
      { formId },
      {
        onSuccess: () => {
          toast.success('スキーマを承認しました')
        },
        onError: () => {
          toast.error('スキーマの承認に失敗しました')
        },
      }
    )
  }

  const fieldMap = new Map(formFields.map((f: FormField) => [f.id, f]))

  const groupedCriteria = new Map<string, FieldCompletionCriteria[]>()
  for (const criteria of completionCriteria) {
    const existing = groupedCriteria.get(criteria.formFieldId) ?? []
    existing.push(criteria)
    groupedCriteria.set(criteria.formFieldId, existing)
  }

  const allFieldIds = new Set([...groupedCriteria.keys()])

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
        Array.from(allFieldIds).map((fieldId: string) => {
          const field = fieldMap.get(fieldId)
          const criteria = groupedCriteria.get(fieldId) ?? []

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

              {criteria.length > 0 && (
                <div className="mb-3">
                  <Typography variant="description" size="sm" weight="medium" className="mb-1">
                    完了条件
                  </Typography>
                  {criteria
                    .sort(
                      (a: FieldCompletionCriteria, b: FieldCompletionCriteria) =>
                        a.sortOrder - b.sortOrder
                    )
                    .map((def: FieldCompletionCriteria) => (
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
