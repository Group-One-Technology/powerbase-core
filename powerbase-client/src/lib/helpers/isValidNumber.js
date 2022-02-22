/**
 * Checks whether given number string is valid or not.
 * https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
 * @param {string} string a number string
 * @returns boolean
 */
export function isValidNumber(str) {
  if (typeof str === 'number') return true;
  if (typeof str !== 'string') return false;
  return !Number.isNaN(Number(str)) && !Number.isNaN(parseFloat(str));
}
