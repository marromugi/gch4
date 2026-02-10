import { zodResolver } from '@hookform/resolvers/zod'
import {
  useForm as useReactHookForm,
  type UseFormProps,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import type { z } from 'zod'

export interface UseZodFormProps<TFieldValues extends FieldValues> extends Omit<
  UseFormProps<TFieldValues>,
  'resolver'
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<TFieldValues, any, any>
}

/**
 * zodResolver を内蔵した useForm ラッパー
 * @example
 * const form = useZodForm({
 *   schema: userSettingsSchema,
 *   defaultValues: { username: '' },
 * })
 */
export function useZodForm<TFieldValues extends FieldValues>({
  schema,
  ...props
}: UseZodFormProps<TFieldValues>): UseFormReturn<TFieldValues> {
  return useReactHookForm<TFieldValues>({
    ...props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
  })
}

// react-hook-form の re-export（必要なものだけ）
export { FormProvider, Controller, useFormContext, useWatch } from 'react-hook-form'
export type { UseFormReturn, FieldErrors, Control, ControllerRenderProps } from 'react-hook-form'
