/**
 * SVGの内容からReactコンポーネントのコードを生成
 */
export const generateComponentCode = (
  componentName: string,
  label: string,
  svgContent: string
): string => {
  // SVGタグの属性を抽出
  const svgMatch = svgContent.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/)
  if (!svgMatch) {
    throw new Error('無効なSVG形式です')
  }

  const svgAttributes = svgMatch[1]
  const svgInner = svgMatch[2].trim()

  // 属性をパース
  const attrs = parseAttributes(svgAttributes)

  // JSX用に属性を整形
  const jsxAttrs = formatJsxAttributes(attrs)

  return `import type { SVGProps } from 'react'

/**
 * ${label}アイコン
 */
export const ${componentName} = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
${jsxAttrs}
      aria-label="${label}"
      {...props}
    >
      <title>${label}</title>
${formatSvgInner(svgInner)}
    </svg>
  )
}
`
}

/**
 * SVG属性をパースしてオブジェクトに変換
 */
const parseAttributes = (attrString: string): Record<string, string> => {
  const attrs: Record<string, string> = {}
  const regex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g
  let match

  while ((match = regex.exec(attrString)) !== null) {
    attrs[match[1]] = match[2]
  }

  return attrs
}

/**
 * 属性をJSX形式に整形
 */
const formatJsxAttributes = (attrs: Record<string, string>): string => {
  const lines: string[] = []

  // 順序を指定して出力
  const order = ['height', 'viewBox', 'width', 'fill']

  for (const key of order) {
    if (attrs[key]) {
      lines.push(`      ${key}="${attrs[key]}"`)
    }
  }

  return lines.join('\n')
}

/**
 * SVG内部要素を整形
 */
const formatSvgInner = (inner: string): string => {
  return inner
    .split('\n')
    .map((line) => `      ${line.trim()}`)
    .filter((line) => line.trim())
    .join('\n')
}

/**
 * index.tsのコードを生成
 */
export const generateIndexCode = (componentNames: string[]): string => {
  const sortedNames = [...componentNames].sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' })
  )

  const exports = sortedNames.map((name) => `export { ${name} } from './${name}'`).join('\n')

  return exports + '\n'
}
