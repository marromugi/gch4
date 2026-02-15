import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormField } from '../../../domain/entity/FormField/FormField'
import { FormSchemaVersion } from '../../../domain/entity/FormSchemaVersion/FormSchemaVersion'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { FormFieldId } from '../../../domain/valueObject/FormFieldId/FormFieldId'
import { FormSchemaVersionId } from '../../../domain/valueObject/FormSchemaVersionId/FormSchemaVersionId'
import { FormSchemaVersionStatus } from '../../../domain/valueObject/FormSchemaVersionStatus/FormSchemaVersionStatus'

// --- Error ---

export class CreateFormValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'CreateFormValidationError'
  }
}

export class CreateFormRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'CreateFormRepositoryError'
  }
}

export type CreateFormError = CreateFormValidationError | CreateFormRepositoryError

// --- Input / Output ---

export interface CreateFormFieldInput {
  label: string
  description: string | null
  intent: string | null
  required: boolean
}

export interface CreateFormInput {
  title: string
  description: string | null
  purpose: string | null
  completionMessage: string | null
  userId: string
  fields: CreateFormFieldInput[]
}

export interface CreateFormDeps {
  formRepository: IFormRepository
  generateId: () => string
}

export type CreateFormOutput = Form

// --- Usecase ---

export class CreateFormUsecase {
  constructor(private readonly deps: CreateFormDeps) {}

  async execute(input: CreateFormInput): Promise<Result<CreateFormOutput, CreateFormError>> {
    const validationErrors: string[] = []

    if (!input.title || input.title.trim().length === 0) {
      validationErrors.push('title is required')
    }

    if (!input.userId || input.userId.trim().length === 0) {
      validationErrors.push('userId is required')
    }

    for (const [i, field] of input.fields.entries()) {
      if (!field.label || field.label.trim().length === 0) {
        validationErrors.push(`fields[${i}].label is required`)
      }
    }

    if (validationErrors.length > 0) {
      return Result.err(new CreateFormValidationError(validationErrors))
    }

    const now = new Date()
    const formId = FormId.fromString(this.deps.generateId())
    const userId = UserId.fromString(input.userId)

    const form = Form.create({
      id: formId,
      title: input.title,
      description: input.description,
      purpose: input.purpose,
      completionMessage: input.completionMessage,
      status: FormStatus.draft(),
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    const saveFormResult = await this.deps.formRepository.save(form)
    if (Result.isErr(saveFormResult)) {
      return Result.err(new CreateFormRepositoryError(saveFormResult.error))
    }

    // Create form fields
    const formFields = input.fields.map((field, index) =>
      FormField.create({
        id: FormFieldId.fromString(this.deps.generateId()),
        formId,
        fieldId: `field_${index + 1}`,
        label: field.label,
        description: field.description,
        intent: field.intent,
        required: field.required,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })
    )

    if (formFields.length > 0) {
      const saveFieldsResult = await this.deps.formRepository.saveFormFields(formFields)
      if (Result.isErr(saveFieldsResult)) {
        return Result.err(new CreateFormRepositoryError(saveFieldsResult.error))
      }
    }

    // Create initial schema version (auto-approved)
    const schemaVersion = FormSchemaVersion.create({
      id: FormSchemaVersionId.fromString(this.deps.generateId()),
      formId,
      version: 1,
      status: FormSchemaVersionStatus.approved(),
      approvedAt: now,
      createdAt: now,
    })

    const saveVersionResult = await this.deps.formRepository.saveSchemaVersion(schemaVersion)
    if (Result.isErr(saveVersionResult)) {
      return Result.err(new CreateFormRepositoryError(saveVersionResult.error))
    }

    return Result.ok(form)
  }
}
