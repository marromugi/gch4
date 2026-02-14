import {
  Button,
  Menu,
  MenuItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  useToast,
} from '@ding/ui'
import { MoreVert } from '@ding/ui/icon'
import { Flex } from '@ding/ui/layout'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { usePublishFormMutation, useCloseFormMutation } from '../hook'
import { StatusBadge } from '../StatusBadge'
import { formDetailHeader } from './const'
import type { FormDetail } from '../type'

interface FormDetailHeaderProps {
  form: FormDetail
  isSchemaApproved: boolean
}

export function FormDetailHeader({ form, isSchemaApproved }: FormDetailHeaderProps) {
  const styles = formDetailHeader()
  const router = useRouter()
  const toast = useToast()
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const { mutate: publishForm, isPending: isPublishing } = usePublishFormMutation(form.id)
  const { mutate: closeForm, isPending: isClosing } = useCloseFormMutation(form.id)

  const handlePublish = () => {
    publishForm(
      { formId: form.id },
      {
        onSuccess: () => {
          setShowPublishModal(false)
          toast.success('フォームを公開しました')
        },
        onError: (error) => {
          toast.error((error as unknown as Error).message || '公開に失敗しました')
        },
      }
    )
  }

  const handleClose = () => {
    closeForm(
      { formId: form.id },
      {
        onSuccess: () => {
          setShowCloseModal(false)
          toast.success('フォームをクローズしました')
        },
        onError: (error) => {
          toast.error((error as unknown as Error).message || 'クローズに失敗しました')
        },
      }
    )
  }

  return (
    <div className={styles.container()}>
      <Typography
        as="span"
        variant="description"
        size="sm"
        className={styles.backLink()}
        onClick={() => router.navigate({ to: '/forms' })}
      >
        ← フォーム一覧に戻る
      </Typography>

      <Flex justify="between" align="center" className={styles.titleRow()}>
        <Flex align="center" gap={3}>
          <Typography variant="body" size="xl" weight="bold">
            {form.title}
          </Typography>
          <StatusBadge status={form.status} />
        </Flex>

        <Menu
          trigger={
            <Button variant="secondary" size="sm">
              <MoreVert width={20} height={20} />
            </Button>
          }
          placement="bottom"
          align="end"
        >
          <MenuItem
            onClick={() =>
              router.navigate({
                to: '/forms/$formId/preview',
                params: { formId: form.id },
              })
            }
            disabled={!isSchemaApproved}
          >
            チャットプレビュー
          </MenuItem>
          {form.status === 'draft' && (
            <MenuItem onClick={() => setShowPublishModal(true)} disabled={!isSchemaApproved}>
              フォームを公開
            </MenuItem>
          )}
          {form.status === 'published' && (
            <MenuItem onClick={() => setShowCloseModal(true)} destructive>
              フォームをクローズ
            </MenuItem>
          )}
        </Menu>
      </Flex>

      <Modal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        title="フォームを公開"
        size="sm"
      >
        <ModalHeader>
          <Typography variant="body" size="lg" weight="semibold">
            フォームを公開しますか？
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography variant="description" size="sm">
            公開すると回答を受け付けるようになります。公開後は基本情報やフォーム項目の編集ができなくなります。
          </Typography>
        </ModalBody>
        <ModalFooter>
          <Flex gap={2} justify="end">
            <Button
              variant="secondary"
              onClick={() => setShowPublishModal(false)}
              disabled={isPublishing}
            >
              キャンセル
            </Button>
            <Button variant="primary" onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? '公開中...' : '公開する'}
            </Button>
          </Flex>
        </ModalFooter>
      </Modal>

      <Modal
        open={showCloseModal}
        onOpenChange={setShowCloseModal}
        title="フォームをクローズ"
        size="sm"
      >
        <ModalHeader>
          <Typography variant="body" size="lg" weight="semibold">
            フォームをクローズしますか？
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography variant="description" size="sm">
            クローズすると新しい回答を受け付けなくなります。この操作は取り消せません。
          </Typography>
        </ModalBody>
        <ModalFooter>
          <Flex gap={2} justify="end">
            <Button
              variant="secondary"
              onClick={() => setShowCloseModal(false)}
              disabled={isClosing}
            >
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleClose} disabled={isClosing}>
              {isClosing ? 'クローズ中...' : 'クローズする'}
            </Button>
          </Flex>
        </ModalFooter>
      </Modal>
    </div>
  )
}
