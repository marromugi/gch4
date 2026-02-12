import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { customFetch, API_BASE_URL } from '@/lib/api/fetcher'
import { useUser } from '@/lib/auth'
import type { CreateJobRequest, CreateJobResponse } from './type'

export const STEP_ITEMS = [
  { value: 'basic', label: '基本情報' },
  { value: 'profile', label: '理想人物像・カルチャー' },
  { value: 'fields', label: 'フォーム項目' },
] as const

export type StepValue = (typeof STEP_ITEMS)[number]['value']

const STEP_ORDER: StepValue[] = ['basic', 'profile', 'fields']

export function useJobCreateWizard() {
  const [currentStep, setCurrentStep] = useState<StepValue>('basic')

  const currentIndex = STEP_ORDER.indexOf(currentStep)

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev)
      return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : prev
    })
  }, [])

  const back = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev)
      return idx > 0 ? STEP_ORDER[idx - 1] : prev
    })
  }, [])

  const goTo = useCallback((step: StepValue) => {
    setCurrentStep(step)
  }, [])

  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === STEP_ORDER.length - 1

  return {
    currentStep,
    currentIndex,
    next,
    back,
    goTo,
    isFirstStep,
    isLastStep,
  }
}

export function useCreateJobMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const user = useUser()

  return useMutation({
    mutationFn: async (data: CreateJobRequest) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }
      return customFetch<CreateJobResponse>({
        url: `${API_BASE_URL}/api/jobs`,
        method: 'POST',
        data: {
          ...data,
          createdBy: user.id,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      router.navigate({ to: '/jobs' })
    },
  })
}
