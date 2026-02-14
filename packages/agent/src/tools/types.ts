import { toJSONSchema } from 'zod/v4/core'
import type { LLMToolDefinition } from '../provider'
import type { z } from 'zod'

/**
 * ツールの定義
 */
export interface Tool<TArgs extends z.ZodType = z.ZodType, TResult extends z.ZodType = z.ZodType> {
  /** ツール名 */
  name: string
  /** ツールの説明 */
  description: string
  /** 引数のスキーマ */
  argsSchema: TArgs
  /** 結果のスキーマ */
  resultSchema: TResult
  /** ツールの実行 */
  execute: (args: z.infer<TArgs>) => Promise<z.infer<TResult>>
}

/**
 * createTool の設定
 */
export interface CreateToolConfig<TArgs extends z.ZodType, TResult extends z.ZodType> {
  name: string
  description: string
  args: TArgs
  result: TResult
  execute: (args: z.infer<TArgs>) => Promise<z.infer<TResult>>
}

/**
 * Zod スキーマからツールを生成する
 */
export function createTool<TArgs extends z.ZodType, TResult extends z.ZodType>(
  config: CreateToolConfig<TArgs, TResult>
): Tool<TArgs, TResult> {
  return {
    name: config.name,
    description: config.description,
    argsSchema: config.args,
    resultSchema: config.result,
    execute: config.execute,
  }
}

/**
 * Zod スキーマを JSON Schema に変換する
 * LLM Provider の chatWithTools で使用
 *
 * Note: Gemini API は JSON Schema 2020-12 の $schema フィールドや
 * additionalProperties をサポートしていないため、これらを再帰的に削除する
 */
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // zod v4 の toJSONSchema を使用
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = toJSONSchema(schema as any) as Record<string, unknown>

  // Gemini API と互換性のないフィールドを再帰的に削除
  return removeIncompatibleFields(jsonSchema)
}

/**
 * Gemini API と互換性のないフィールドを再帰的に削除する
 */
function removeIncompatibleFields(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    // $schema と additionalProperties は Gemini API でサポートされていない
    if (key === '$schema' || key === 'additionalProperties') {
      continue
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = removeIncompatibleFields(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? removeIncompatibleFields(item as Record<string, unknown>)
          : item
      )
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Tool を LLMToolDefinition に変換する
 */
export function toolToLLMDefinition(tool: Tool): LLMToolDefinition {
  return {
    name: tool.name,
    description: tool.description,
    parameters: zodToJsonSchema(tool.argsSchema),
  }
}

/**
 * ツール実行結果
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * ツールを実行し、引数をバリデーションする
 */
export async function executeTool<TArgs extends z.ZodType, TResult extends z.ZodType>(
  tool: Tool<TArgs, TResult>,
  rawArgs: unknown
): Promise<ToolExecutionResult<z.infer<TResult>>> {
  // 引数のバリデーション
  const parseResult = tool.argsSchema.safeParse(rawArgs)
  if (!parseResult.success) {
    return {
      success: false,
      error: `Invalid arguments: ${parseResult.error.message}`,
    }
  }

  try {
    const result = await tool.execute(parseResult.data)
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
