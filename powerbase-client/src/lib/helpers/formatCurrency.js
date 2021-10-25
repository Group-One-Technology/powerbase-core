/**
 * Format the given currency based on the given options.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
 * @param {number} value the currency
 * @param {object} options
 * @returns string
 */
export function formatCurrency(value, options = {}) {
  if (value == null || value === '' || Number.isNaN(+value)) return null;

  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
}
