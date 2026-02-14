import { z } from 'zod'
import { createTool } from '../../../tools/types'
import { PlanSchema } from '../schemas'

/**
 * create_plan ツールの引数スキーマ
 * PlanSchema をそのまま使用
 */
export const createPlanArgsSchema = PlanSchema

/**
 * create_plan ツールの結果スキーマ
 */
export const createPlanResultSchema = z.object({
  success: z.literal(true),
  plan: PlanSchema,
})

/**
 * create_plan ツール: インタビュープランを作成する
 *
 * フィールドの質問順序と質問タイプを決定し、プランとして出力する。
 */
export const createPlanTool = createTool({
  name: 'create_plan',
  description: `インタビュープランを作成する。フィールドの質問順序と質問タイプを決定し、プランとして出力する。

ルール:
1. basic（基本的な質問）を先に配置
2. abstract（抽象的な質問）を後に配置
3. required=true のフィールドを優先
4. 各フィールドの質問タイプとその判断理由を明記`,
  args: createPlanArgsSchema,
  result: createPlanResultSchema,
  execute: async (args) => {
    // バリデーション済みのプランをそのまま返す
    return {
      success: true as const,
      plan: args,
    }
  },
})

export type CreatePlanToolArgs = z.infer<typeof createPlanArgsSchema>
export type CreatePlanToolResult = z.infer<typeof createPlanResultSchema>
