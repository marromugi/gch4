import { Result } from '../../../domain/shared/Result/Result'
import { FormField } from '../../../domain/entity/FormField/FormField'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormFieldId } from '../../../domain/valueObject/FormFieldId/FormFieldId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

// --- Error ---

export class SaveFormFieldsNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(formId: string) {
    super(`Form not found: ${formId}`)
    this.name = 'SaveFormFieldsNotFoundError'
  }
}

export class SaveFormFieldsForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Only the owner can save form fields')
    this.name = 'SaveFormFieldsForbiddenError'
  }
}

export class SaveFormFieldsRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'SaveFormFieldsRepositoryError'
  }
}

export type SaveFormFieldsError =
  | SaveFormFieldsNotFoundError
  | SaveFormFieldsForbiddenError
  | SaveFormFieldsRepositoryError

// --- Input / Output ---

export interface SaveFormFieldInput {
  id?: string // 既存フィールドのID（省略時は新規作成）
  label: string
  description: string | null
  intent: string | null
  required: boolean
}

export interface SaveFormFieldsInput {
  formId: string
  userId: string
  fields: SaveFormFieldInput[]
}

export interface SaveFormFieldsDeps {
  formRepository: IFormRepository
  generateId: () => string
}

export type SaveFormFieldsOutput = FormField[]

// --- Usecase ---

export class SaveFormFieldsUsecase {
  constructor(private readonly deps: SaveFormFieldsDeps) {}

  async execute(
    input: SaveFormFieldsInput
  ): Promise<Result<SaveFormFieldsOutput, SaveFormFieldsError>> {
    const formId = FormId.fromString(input.formId)

    // フォームの存在チェック
    const formResult = await this.deps.formRepository.findById(formId)
    if (Result.isErr(formResult)) {
      return Result.err(new SaveFormFieldsNotFoundError(input.formId))
    }

    // 権限チェック: 所有者のみ
    if (!formResult.value.createdBy.equals(UserId.fromString(input.userId))) {
      return Result.err(new SaveFormFieldsForbiddenError())
    }

    const now = new Date()

    // フィールド作成
    const fields = input.fields.map((f, index) => {
      const fieldId = f.id
        ? FormFieldId.fromString(f.id)
        : FormFieldId.fromString(this.deps.generateId())

      return FormField.create({
        id: fieldId,
        formId,
        fieldId: `field_${index + 1}`,
        label: f.label,
        description: f.description,
        intent: f.intent,
        required: f.required,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })
    })

    // 既存フィールド削除
    const deleteResult = await this.deps.formRepository.deleteFormFieldsByFormId(formId)
    if (Result.isErr(deleteResult)) {
      return Result.err(new SaveFormFieldsRepositoryError(deleteResult.error))
    }

    // 新規フィールド保存
    if (fields.length > 0) {
      const saveResult = await this.deps.formRepository.saveFormFields(fields)
      if (Result.isErr(saveResult)) {
        return Result.err(new SaveFormFieldsRepositoryError(saveResult.error))
      }
    }

    return Result.ok(fields)
  }
}
