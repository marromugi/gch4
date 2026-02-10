/**
 * ファイル名をPascalCaseのコンポーネント名に変換
 * @example
 * 'add-icon.svg' → 'AddIcon'
 * 'arrow_left.svg' → 'ArrowLeft'
 * 'home.svg' → 'Home'
 */
export const toPascalCase = (fileName: string): string => {
  const baseName = fileName.replace(/\.svg$/i, '')

  return baseName
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * コンポーネント名からaria-labelとtitle用のラベルを生成
 * @example
 * 'AddIcon' → 'Add'
 * 'ArrowLeftIcon' → 'Arrow Left'
 */
export const toLabel = (componentName: string): string => {
  return componentName
    .replace(/Icon$/i, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
}
