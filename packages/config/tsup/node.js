import { base } from './base.js'

/**
 * @param {import('tsup').Options} options
 * @returns {import('tsup').Options}
 */
export const node = (options = {}) =>
  base({
    target: 'node20',
    sourcemap: true,
    ...options,
  })
