/**
 * Validates an integer string.
 *
 * @param {string} value The string to be validated
 * @returns boolean - check whether the input is a valid integer or not.
 */
export function INTEGER_STRING_VALIDATOR(value) {
  if ((typeof value === 'number' && value == null) || !value) {
    throw new Error('Required');
  }

  if (Number.isNaN(+value) || value.includes('.')) {
    throw new Error('Must be a valid integer');
  }

  return true;
}
