import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { optimize } from 'svgo'

import { getSvgoConfig, type IconType } from './utils/converter'
import { toLabel, toPascalCase } from './utils/nameUtils'
import { generateComponentCode, generateIndexCode } from './utils/template'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SVG_MONO_DIR = path.resolve(__dirname, './svg/mono')
const SVG_FULLCOLOR_DIR = path.resolve(__dirname, './svg/fullcolor')
const OUTPUT_DIR = path.resolve(__dirname, '../../src/components/icon')

/**
 * アイコンソース情報
 */
interface IconSource {
  fileName: string
  filePath: string
  type: IconType
}

type IconGeneratorError =
  | { type: 'FILE_NOT_FOUND'; path: string }
  | { type: 'INVALID_SVG'; path: string; reason: string }
  | { type: 'WRITE_ERROR'; path: string; error: Error }
  | { type: 'DUPLICATE_NAME'; name: string; files: string[] }

const handleErrors = (errors: IconGeneratorError[]): void => {
  if (errors.length === 0) return

  console.error('\n========== エラー一覧 ==========')

  for (const error of errors) {
    switch (error.type) {
      case 'FILE_NOT_FOUND':
        console.error(`[FILE_NOT_FOUND] ${error.path}`)
        break
      case 'INVALID_SVG':
        console.error(`[INVALID_SVG] ${error.path}: ${error.reason}`)
        break
      case 'WRITE_ERROR':
        console.error(`[WRITE_ERROR] ${error.path}: ${error.error.message}`)
        break
      case 'DUPLICATE_NAME':
        console.error(`[DUPLICATE_NAME] "${error.name}" が重複: ${error.files.join(', ')}`)
        break
    }
  }

  process.exit(1)
}

/**
 * ディレクトリからSVGファイル一覧を取得
 */
const getSvgFilesFromDir = async (dirPath: string, type: IconType): Promise<IconSource[]> => {
  try {
    await fs.access(dirPath)
    const files = await fs.readdir(dirPath)
    return files
      .filter((f) => f.endsWith('.svg'))
      .map((fileName) => ({
        fileName,
        filePath: path.join(dirPath, fileName),
        type,
      }))
  } catch {
    // ディレクトリが存在しない場合は空配列を返す
    return []
  }
}

const main = async (): Promise<void> => {
  console.log('アイコン生成を開始します...')

  // 1. 両ディレクトリからSVGファイルを収集
  const monoIcons = await getSvgFilesFromDir(SVG_MONO_DIR, 'mono')
  const fullcolorIcons = await getSvgFilesFromDir(SVG_FULLCOLOR_DIR, 'fullcolor')
  const allIcons = [...monoIcons, ...fullcolorIcons]

  if (allIcons.length === 0) {
    console.log('SVGファイルが見つかりませんでした')
    console.log('以下のディレクトリにSVGファイルを配置してください:')
    console.log(`  - ${SVG_MONO_DIR} (モノクロアイコン)`)
    console.log(`  - ${SVG_FULLCOLOR_DIR} (フルカラーアイコン)`)
    return
  }

  console.log(`${monoIcons.length}個のモノクロアイコンを検出`)
  console.log(`${fullcolorIcons.length}個のフルカラーアイコンを検出`)

  // 2. 出力ディレクトリの作成
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  // 3. 重複チェック（mono と fullcolor 間での重複も含む）
  const componentNames: string[] = []
  const errors: IconGeneratorError[] = []
  const nameToFiles: Map<string, { file: string; type: IconType }[]> = new Map()

  for (const icon of allIcons) {
    const componentName = toPascalCase(icon.fileName)
    const existing = nameToFiles.get(componentName) || []
    nameToFiles.set(componentName, [...existing, { file: icon.fileName, type: icon.type }])
  }

  for (const [name, files] of nameToFiles) {
    if (files.length > 1) {
      const fileDescriptions = files.map((f) => `${f.file} (${f.type})`)
      errors.push({
        type: 'DUPLICATE_NAME',
        name,
        files: fileDescriptions,
      })
    }
  }

  if (errors.length > 0) {
    handleErrors(errors)
    return
  }

  // 4. 各SVGファイルを変換
  for (const icon of allIcons) {
    try {
      const componentName = toPascalCase(icon.fileName)
      const label = toLabel(componentName)

      const svgContent = await fs.readFile(icon.filePath, 'utf-8')

      // アイコンタイプに応じたSVGO設定を使用
      const optimized = optimize(svgContent, getSvgoConfig(icon.type))
      const componentCode = generateComponentCode(componentName, label, optimized.data)

      await fs.writeFile(path.join(OUTPUT_DIR, `${componentName}.tsx`), componentCode)

      componentNames.push(componentName)
      const typeLabel = icon.type === 'fullcolor' ? '[fullcolor]' : '[mono]'
      console.log(`  [OK] ${typeLabel} ${icon.fileName} → ${componentName}.tsx`)
    } catch (error) {
      errors.push({
        type: 'INVALID_SVG',
        path: icon.fileName,
        reason: error instanceof Error ? error.message : '不明なエラー',
      })
    }
  }

  // 5. index.tsの生成
  if (componentNames.length > 0) {
    const indexCode = generateIndexCode(componentNames)
    await fs.writeFile(path.join(OUTPUT_DIR, 'index.ts'), indexCode)
    console.log('  [OK] index.ts を生成')
  }

  // 6. エラーレポート
  if (errors.length > 0) {
    handleErrors(errors)
  }

  console.log(`\n完了: ${componentNames.length}個のコンポーネントを生成しました`)
}

main().catch(console.error)
