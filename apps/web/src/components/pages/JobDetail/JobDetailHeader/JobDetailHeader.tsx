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
import { usePublishJobMutation, useCloseJobMutation } from '../hook'
import { StatusBadge } from '../StatusBadge'
import { jobDetailHeader } from './const'
import type { JobDetail } from '../type'

interface JobDetailHeaderProps {
  job: JobDetail
  isSchemaApproved: boolean
}

export function JobDetailHeader({ job, isSchemaApproved }: JobDetailHeaderProps) {
  const styles = jobDetailHeader()
  const router = useRouter()
  const toast = useToast()
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const { mutate: publishJob, isPending: isPublishing } = usePublishJobMutation(job.id)
  const { mutate: closeJob, isPending: isClosing } = useCloseJobMutation(job.id)

  const handlePublish = () => {
    publishJob(
      { jobId: job.id },
      {
        onSuccess: () => {
          setShowPublishModal(false)
          toast.success('求人を公開しました')
        },
        onError: (error) => {
          toast.error((error as unknown as Error).message || '公開に失敗しました')
        },
      }
    )
  }

  const handleClose = () => {
    closeJob(
      { jobId: job.id },
      {
        onSuccess: () => {
          setShowCloseModal(false)
          toast.success('求人をクローズしました')
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
        onClick={() => router.navigate({ to: '/jobs' })}
      >
        ← 求人一覧に戻る
      </Typography>

      <Flex justify="between" align="center" className={styles.titleRow()}>
        <Flex align="center" gap={3}>
          <Typography variant="body" size="xl" weight="bold">
            {job.title}
          </Typography>
          <StatusBadge status={job.status} />
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
                to: '/jobs/$jobId/preview',
                params: { jobId: job.id },
              })
            }
            disabled={!isSchemaApproved}
          >
            チャットプレビュー
          </MenuItem>
          {job.status === 'draft' && (
            <MenuItem onClick={() => setShowPublishModal(true)} disabled={!isSchemaApproved}>
              求人を公開
            </MenuItem>
          )}
          {job.status === 'open' && (
            <MenuItem onClick={() => setShowCloseModal(true)} destructive>
              求人をクローズ
            </MenuItem>
          )}
        </Menu>
      </Flex>

      <Modal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        title="求人を公開"
        size="sm"
      >
        <ModalHeader>
          <Typography variant="body" size="lg" weight="semibold">
            求人を公開しますか？
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography variant="description" size="sm">
            公開すると応募を受け付けるようになります。公開後は基本情報やフォーム項目の編集ができなくなります。
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
        title="求人をクローズ"
        size="sm"
      >
        <ModalHeader>
          <Typography variant="body" size="lg" weight="semibold">
            求人をクローズしますか？
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography variant="description" size="sm">
            クローズすると新しい応募を受け付けなくなります。この操作は取り消せません。
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
