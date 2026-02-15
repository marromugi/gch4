import { z } from 'zod'
import { createTool } from '../../../tools/types'

/**
 * 完了条件のスキーマ
 */
export const criteriaSchema = z.object({
  criteriaKey: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/, 'criteriaKey は snake_case で記述してください')
    .describe('完了条件の識別キー（snake_case）'),
  criteria: z.string().min(1).describe('収集すべき事実・情報'),
  doneCondition: z.string().min(1).describe('完了条件（どうなれば収集完了か）'),
  questioningHints: z.string().nullable().describe('質問時のヒント（任意）'),
})

/**
 * 生成されるフィールドのスキーマ
 * FormField ドメインに準拠 + 完了条件・禁止事項を含む
 */
export const generatedFieldSchema = z.object({
  fieldId: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/, 'fieldId は snake_case で記述してください')
    .describe('フィールドの識別子（snake_case）'),
  label: z.string().min(1).describe('フィールドの表示名'),
  description: z.string().nullable().describe('フィールドの説明（任意）'),
  intent: z.string().nullable().describe('深掘り観点（何を収集したいか）'),
  required: z.boolean().describe('必須フラグ'),
  sortOrder: z.number().int().min(0).describe('表示順序（0始まり、基本情報→詳細→抽象的質問の順）'),
  criteria: z.array(criteriaSchema).min(1).describe('このフィールドの完了条件リスト'),
  boundaries: z.array(z.string()).describe('聞いてはいけないこと（プライバシー/セキュリティ観点）'),
})

/**
 * generate_fields ツールの引数スキーマ
 */
export const generateFieldsArgsSchema = z.object({
  fields: z.array(generatedFieldSchema).min(1).describe('生成するフォームフィールドのリスト'),
})

/**
 * generate_fields ツールの結果スキーマ
 */
export const generateFieldsResultSchema = z.object({
  success: z.literal(true),
  fields: z.array(generatedFieldSchema),
})

/**
 * generate_fields ツール
 * フォームフィールドと完了条件を生成して完了する
 */
export const generateFieldsTool = createTool({
  name: 'generate_fields',
  description: `フォームフィールドと完了条件を生成する。

収集した情報に基づいて、フォームフィールドとその完了条件・禁止事項を出力する。

## フィールドの構成
- fieldId: snake_case の識別子（例: full_name, email_address）
- label: ユーザーに表示する名前（日本語）
- description: フィールドの説明（任意、nullも可）
- intent: 何を収集したいかの深掘り観点（任意、nullも可）
- required: 必須かどうか
- sortOrder: 表示順序（0始まり、基本情報→詳細→抽象的質問の順で最適化）
- criteria: 完了条件のリスト（各条件には criteriaKey, criteria, doneCondition, questioningHints を含む）
- boundaries: 聞いてはいけないこと（プライバシー・セキュリティ観点の禁止事項）

## criteria の設計指針
- intentを分解し、収集すべき具体的な情報を列挙
- 1フィールドに複数のcriteriaがあり得る
- doneConditionは検証可能な条件にする（例: 「具体的なエピソードが1つ以上含まれている」）

## boundaries の設計指針
- プライバシー: 年齢、宗教、政治信条、健康状態、家族構成
- セキュリティ: パスワード、金融情報、個人識別番号
- 法的リスク: 差別的質問、法的に保護された情報
- intentに関係ない個人情報は収集しない

## sortOrder の設計指針
- 基本情報（氏名、連絡先）を先に
- 詳細情報（経歴、スキル）を中盤に
- 抽象的質問（価値観、動機）を最後に
- 必須項目を優先

## 例
\`\`\`json
{
  "fields": [
    {
      "fieldId": "full_name",
      "label": "氏名",
      "description": null,
      "intent": null,
      "required": true,
      "sortOrder": 0,
      "criteria": [
        {
          "criteriaKey": "full_name_value",
          "criteria": "回答者のフルネーム",
          "doneCondition": "姓名が両方含まれている",
          "questioningHints": null
        }
      ],
      "boundaries": ["ニックネームや旧姓の理由は聞かない"]
    },
    {
      "fieldId": "motivation",
      "label": "志望動機",
      "description": "当社を志望した理由をお聞かせください",
      "intent": "応募者の価値観と当社への理解度を把握する",
      "required": true,
      "sortOrder": 2,
      "criteria": [
        {
          "criteriaKey": "company_understanding",
          "criteria": "当社の事業や文化への理解",
          "doneCondition": "具体的な事業内容や価値観への言及がある",
          "questioningHints": "当社のどの部分に魅力を感じたか"
        },
        {
          "criteriaKey": "career_alignment",
          "criteria": "キャリアプランとの整合性",
          "doneCondition": "自身のキャリア目標と当社での成長イメージが述べられている",
          "questioningHints": "どのように成長したいか"
        }
      ],
      "boundaries": ["他社の批判は求めない", "給与や待遇を主な理由として深掘りしない"]
    }
  ]
}
\`\`\``,
  args: generateFieldsArgsSchema,
  result: generateFieldsResultSchema,
  execute: async (args) => ({
    success: true as const,
    fields: args.fields,
  }),
})

/**
 * 型エクスポート
 */
export type Criteria = z.infer<typeof criteriaSchema>
export type GeneratedField = z.infer<typeof generatedFieldSchema>
export type GenerateFieldsArgs = z.infer<typeof generateFieldsArgsSchema>
