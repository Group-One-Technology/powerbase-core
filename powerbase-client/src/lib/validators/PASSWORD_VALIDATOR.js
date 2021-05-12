/**
 * Validates a password input.
 *
 * @param {string} value The password that has been inputted by the user.
 * @returns boolean - check whether the input is valid or not.
 */
export function PASSWORD_VALIDATOR(value) {
  if (!value) {
    throw new Error('Required');
  }

  if (value.length < 6) {
    throw new Error('Must be 6 characters or more');
  }

  return true;
}
