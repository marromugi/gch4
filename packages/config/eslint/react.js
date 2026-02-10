// @ts-check
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import { typescript } from './typescript.js'

/**
 * React ESLint設定を生成
 * @param {Object} options - オプション
 * @param {string} [options.tsconfigRootDir] - tsconfig.jsonのルートディレクトリ
 * @returns {import('eslint').Linter.Config[]}
 */
export const react = (options = {}) => [
  ...typescript(options),
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/display-name': 'off',
    },
  },
]
