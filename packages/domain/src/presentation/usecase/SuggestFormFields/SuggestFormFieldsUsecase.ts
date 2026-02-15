import { Result } from '../../../domain/shared/Result/Result'

// --- LLM Provider Interface (簡易版) ---

export interface SuggestFormFieldsLLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SuggestFormFieldsLLMOptions {
  systemPrompt?: string
}

export interface SuggestFormFieldsLLMResponse {
  text: string
}

export interface ISuggestFormFieldsLLMProvider {
  chat(
    messages: SuggestFormFieldsLLMMessage[],
    options?: SuggestFormFieldsLLMOptions
  ): Promise<SuggestFormFieldsLLMResponse>
}

// --- Error ---

export class SuggestFormFieldsValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'SuggestFormFieldsValidationError'
  }
}

export class SuggestFormFieldsLLMError extends Error {
  readonly type = 'llm_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'SuggestFormFieldsLLMError'
  }
}

export class SuggestFormFieldsParseError extends Error {
  readonly type = 'parse_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'SuggestFormFieldsParseError'
  }
}

export type SuggestFormFieldsError =
  | SuggestFormFieldsValidationError
  | SuggestFormFieldsLLMError
  | SuggestFormFieldsParseError

// --- Input / Output ---

export interface SuggestFormFieldsInput {
  description: string
}

export interface SuggestFormFieldsDeps {
  llmProvider: ISuggestFormFieldsLLMProvider
}

export interface SuggestedField {
  label: string
  description: string | null
  intent: string | null
  required: boolean
}

export interface SuggestFormFieldsOutput {
  fields: SuggestedField[]
}

// --- Usecase ---

export class SuggestFormFieldsUsecase {
  constructor(private readonly deps: SuggestFormFieldsDeps) {}

  async execute(
    input: SuggestFormFieldsInput
  ): Promise<Result<SuggestFormFieldsOutput, SuggestFormFieldsError>> {
    // バリデーション
    if (!input.description || input.description.trim().length === 0) {
      return Result.err(new SuggestFormFieldsValidationError('description is required'))
    }

    const systemPrompt = `You are a form design assistant. Based on the user's description, suggest appropriate form fields.
Return a JSON array of field objects with the following structure:
- label: string (field label shown to users)
- description: string | null (optional help text)
- intent: string | null (what information this field collects)
- required: boolean (whether this field is required)

Only return the JSON array, no other text.`

    let llmResult: SuggestFormFieldsLLMResponse
    try {
      llmResult = await this.deps.llmProvider.chat(
        [
          {
            role: 'user',
            content: `Please suggest form fields for the following purpose: ${input.description}`,
          },
        ],
        { systemPrompt }
      )
    } catch (e) {
      return Result.err(
        new SuggestFormFieldsLLMError(e instanceof Error ? e.message : 'LLM call failed')
      )
    }

    // JSON パース
    let fields: SuggestedField[]
    try {
      fields = JSON.parse(llmResult.text)
      if (!Array.isArray(fields)) {
        throw new Error('Response is not an array')
      }
    } catch (e) {
      return Result.err(
        new SuggestFormFieldsParseError(
          `Failed to parse LLM response: ${e instanceof Error ? e.message : 'Unknown error'}`
        )
      )
    }

    return Result.ok({ fields })
  }
}
