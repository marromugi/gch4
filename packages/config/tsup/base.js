/**
 * @param {import('tsup').Options} options
 * @returns {import('tsup').Options}
 */
export const base = (options = {}) => ({
  format: ['esm'],
  clean: true,
  ...options,
})
