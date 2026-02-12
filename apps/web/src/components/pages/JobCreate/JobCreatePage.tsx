import { Box, Button, Tab, Typography } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { cn } from '@ding/ui/lib'
import { useZodForm, FormProvider } from '@/lib/hook-form'
import { jobCreatePage } from './const'
import { useJobCreateWizard, useCreateJobMutation, STEP_ITEMS } from './hook'
import {
  jobCreateFormSchema,
  stepBasicInfoSchema,
  stepCandidateProfileSchema,
  stepFormFieldsSchema,
} from './schema'
import { StepBasicInfo } from './StepBasicInfo'
import { StepCandidateProfile } from './StepCandidateProfile'
import { StepFormFields } from './StepFormFields'
import type { StepValue } from './hook'
import type { JobCreatePageProps, JobCreateFormValues } from './type'
import type { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STEP_SCHEMAS: Record<StepValue, z.ZodType<any>> = {
  basic: stepBasicInfoSchema,
  profile: stepCandidateProfileSchema,
  fields: stepFormFieldsSchema,
}

export function JobCreatePage({ className }: JobCreatePageProps) {
  const styles = jobCreatePage()
  const { currentStep, next, back, goTo, isFirstStep, isLastStep } = useJobCreateWizard()
  const { mutate: createJob, isPending } = useCreateJobMutation()

  const form = useZodForm({
    schema: jobCreateFormSchema,
    defaultValues: {
      title: '',
      idealCandidate: null,
      cultureContext: null,
      formFields: [{ label: '', intent: '', required: false }],
    },
  })

  const validateCurrentStep = () => {
    const currentSchema = STEP_SCHEMAS[currentStep]
    const currentValues = form.getValues()

    const result = currentSchema.safeParse(currentValues)
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') as keyof JobCreateFormValues
        form.setError(path, { message: issue.message })
      }
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      next()
    }
  }

  const handleTabChange = (value: string) => {
    goTo(value as StepValue)
  }

  const handleSubmit = form.handleSubmit((data) => {
    createJob({
      title: data.title,
      idealCandidate: data.idealCandidate || null,
      cultureContext: data.cultureContext || null,
      formFields: data.formFields.map((f) => ({
        label: f.label,
        intent: f.intent || '',
        required: f.required,
      })),
    })
  })

  return (
    <Box className={cn(styles.container(), className)}>
      <div className={styles.header()}>
        <Typography variant="body" size="2xl" weight="semibold" className={styles.title()}>
          求人作成
        </Typography>
      </div>

      <div className={styles.tabWrapper()}>
        <Tab items={[...STEP_ITEMS]} value={currentStep} onChange={handleTabChange} size="md" />
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <div className={styles.stepContent()}>
            {currentStep === 'basic' && <StepBasicInfo />}
            {currentStep === 'profile' && <StepCandidateProfile />}
            {currentStep === 'fields' && <StepFormFields />}
          </div>

          <div className={styles.footer()}>
            <div>
              {!isFirstStep && (
                <Button type="button" variant="secondary" onClick={back}>
                  戻る
                </Button>
              )}
            </div>

            <Flex gap={2}>
              {isLastStep ? (
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? '作成中...' : '作成'}
                </Button>
              ) : (
                <Button type="button" variant="primary" onClick={handleNext}>
                  次へ
                </Button>
              )}
            </Flex>
          </div>
        </form>
      </FormProvider>
    </Box>
  )
}
