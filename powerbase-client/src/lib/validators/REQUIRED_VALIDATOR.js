/**
 * Validates a required field.
 *
 * @param {string} value The string to be validated
 * @returns boolean - check whether the input has a value or not.
 */
 export function REQUIRED_VALIDATOR(value) {
  if ((typeof value === 'number' && value == null) || !value) {
    throw new Error('Required');
  }

  return true;
}
