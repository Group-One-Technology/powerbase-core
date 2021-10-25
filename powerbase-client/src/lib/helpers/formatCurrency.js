/**
 * Format the given currency based on the given options.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
 * @param {number} value the currency
 * @param {object} options
 * @returns string
 */
export function formatCurrency(value, options = {}) {
  if (value == null || value === '') return null;

  return value.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
}
