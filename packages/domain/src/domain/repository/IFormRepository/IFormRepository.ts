import type { Result } from '../../shared/Result/Result'
import type { Form } from '../../entity/Form/Form'
import type { FormField } from '../../entity/FormField/FormField'
import type { FormSchemaVersion } from '../../entity/FormSchemaVersion/FormSchemaVersion'
import type { FieldCompletionCriteria } from '../../entity/FieldCompletionCriteria/FieldCompletionCriteria'
import type { FormId } from '../../valueObject/FormId/FormId'
import type { UserId } from '../../valueObject/UserId/UserId'
import type { FormSchemaVersionId } from '../../valueObject/FormSchemaVersionId/FormSchemaVersionId'

export interface IFormRepository {
  findById(id: FormId): Promise<Result<Form, Error>>
  findAll(): Promise<Result<Form[], Error>>
  findByUserId(userId: UserId): Promise<Result<Form[], Error>>
  save(form: Form): Promise<Result<void, Error>>
  delete(id: FormId): Promise<Result<void, Error>>

  // FormField
  findFormFieldsByFormId(formId: FormId): Promise<Result<FormField[], Error>>
  saveFormField(field: FormField): Promise<Result<void, Error>>
  saveFormFields(fields: FormField[]): Promise<Result<void, Error>>
  deleteFormFieldsByFormId(formId: FormId): Promise<Result<void, Error>>

  // FormSchemaVersion
  findSchemaVersionById(id: FormSchemaVersionId): Promise<Result<FormSchemaVersion, Error>>
  findSchemaVersionsByFormId(formId: FormId): Promise<Result<FormSchemaVersion[], Error>>
  findLatestSchemaVersionByFormId(formId: FormId): Promise<Result<FormSchemaVersion | null, Error>>
  saveSchemaVersion(version: FormSchemaVersion): Promise<Result<void, Error>>

  // FieldCompletionCriteria
  findCompletionCriteriaBySchemaVersionId(
    schemaVersionId: FormSchemaVersionId
  ): Promise<Result<FieldCompletionCriteria[], Error>>
  saveCompletionCriteria(criteria: FieldCompletionCriteria[]): Promise<Result<void, Error>>
}
