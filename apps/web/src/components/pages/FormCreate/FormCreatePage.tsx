import { Box, Button, Tab, Typography } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { cn } from '@ding/ui/lib'
import { useZodForm, FormProvider } from '@/lib/hook-form'
import { formCreatePage } from './const'
import { useFormCreateWizard, useCreateFormMutation, STEP_ITEMS } from './hook'
import { formCreateFormSchema, stepBasicInfoSchema, stepFormFieldsSchema } from './schema'
import { StepBasicInfo } from './StepBasicInfo'
import { StepFormFields } from './StepFormFields'
import type { StepValue } from './hook'
import type { FormCreatePageProps, FormCreateFormValues } from './type'
import type { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STEP_SCHEMAS: Record<StepValue, z.ZodType<any>> = {
  basic: stepBasicInfoSchema,
  fields: stepFormFieldsSchema,
}

export function FormCreatePage({ className }: FormCreatePageProps) {
  const styles = formCreatePage()
  const { currentStep, next, back, goTo, isFirstStep, isLastStep } = useFormCreateWizard()
  const { mutate: createForm, isPending } = useCreateFormMutation()

  const form = useZodForm({
    schema: formCreateFormSchema,
    defaultValues: {
      title: '',
      purpose: null,
      completionMessage: null,
      formFields: [{ label: '', intent: '', required: false }],
    },
  })

  const validateCurrentStep = () => {
    const currentSchema = STEP_SCHEMAS[currentStep]
    const currentValues = form.getValues()

    const result = currentSchema.safeParse(currentValues)
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') as keyof FormCreateFormValues
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
    createForm({
      title: data.title,
      purpose: data.purpose || null,
      completionMessage: data.completionMessage || null,
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
          フォーム作成
        </Typography>
      </div>

      <div className={styles.tabWrapper()}>
        <Tab items={[...STEP_ITEMS]} value={currentStep} onChange={handleTabChange} size="md" />
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <div className={styles.stepContent()}>
            {currentStep === 'basic' && <StepBasicInfo />}
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
