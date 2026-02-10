// @ts-check
import tseslint from 'typescript-eslint'
import { base } from './base.js'

/**
 * TypeScript ESLint設定を生成
 * @param {Object} options - オプション
 * @param {string} [options.tsconfigRootDir] - tsconfig.jsonのルートディレクトリ
 * @returns {import('eslint').Linter.Config[]}
 */
export const typescript = (options = {}) => {
  const { tsconfigRootDir } = options

  return [
    ...base,
    ...tseslint.configs.recommended,
    {
      languageOptions: {
        parserOptions: {
          projectService: {
            allowDefaultProject: [
              'eslint.config.js',
              'tsup.config.ts',
              '.storybook/*.ts',
              '.storybook/*.tsx',
            ],
          },
          ...(tsconfigRootDir && { tsconfigRootDir }),
        },
      },
      settings: {
        'import-x/resolver': {
          typescript: {
            alwaysTryTypes: true,
            ...(tsconfigRootDir && { project: tsconfigRootDir }),
          },
        },
      },
      rules: {
        // TypeScript固有ルール
        '@typescript-eslint/no-unused-vars': 'off', // unused-importsが処理
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
        '@typescript-eslint/no-import-type-side-effects': 'error',
      },
    },
  ]
}
