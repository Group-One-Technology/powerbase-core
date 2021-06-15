const regex = /[a-zA-z|_]+[a-zA-z|0-9|_]+/;

/**
 * Validates an SQL identifer.
 * Ex. database names.
 *
 * @param {string} value The string to be validated
 * @returns boolean - check whether the input is a valid SQL identifier or not.
 */
export function SQL_IDENTIFIER_VALIDATOR(value) {
  if (!value) {
    throw new Error('Required');
  }

  if (!regex.test(String(value))) {
    throw new Error('Not a valid value. Must start with a letter or an underscore. Subsequent characters must be either a number, a letter or an underscore.');
  }

  return true;
}
