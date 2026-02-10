import type { Config } from 'svgo'

/**
 * アイコンタイプ
 * - mono: モノクロアイコン（currentColorに変換）
 * - fullcolor: フルカラーアイコン（元の色を保持）
 */
export type IconType = 'mono' | 'fullcolor'

/**
 * 共通のSVGOプラグイン
 */
const commonPlugins = [
  'removeXMLNS',
  'removeComments',
  'removeMetadata',
  'removeTitle',
  'removeDesc',
  'removeUselessDefs',
  'cleanupIds',
  'removeEmptyAttrs',
  'removeEmptyContainers',
] as const

/**
 * svgoの設定を取得
 * @param type アイコンタイプ（デフォルト: mono）
 * - mono: fill属性をcurrentColorに変換
 * - fullcolor: 元の色を保持
 */
export const getSvgoConfig = (type: IconType = 'mono'): Config => {
  if (type === 'fullcolor') {
    // フルカラー: 元の色を保持（convertColorsを使用しない）
    return {
      plugins: [...commonPlugins],
    }
  }

  // モノクロ: fill属性をcurrentColorに変換
  return {
    plugins: [
      ...commonPlugins,
      {
        name: 'convertColors',
        params: {
          currentColor: true,
        },
      },
    ],
  }
}
