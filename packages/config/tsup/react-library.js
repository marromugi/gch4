import { base } from './base.js'

/**
 * @param {import('tsup').Options & { external?: string[] }} options
 * @returns {import('tsup').Options}
 */
export const reactLibrary = (options = {}) => {
  const { external = [], ...rest } = options

  return base({
    dts: true,
    splitting: true,
    external: ['react', 'react-dom', ...external],
    ...rest,
  })
}
