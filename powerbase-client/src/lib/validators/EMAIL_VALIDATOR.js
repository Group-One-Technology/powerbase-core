import { isValidEmail } from '@lib/helpers/isValidEmail';

/**
 * Validates an email input.
 *
 * @param {string} value The email that has been inputted by the user.
 * @returns boolean - check whether the input is valid or not.
 */
export function EMAIL_VALIDATOR(value) {
  if (!value) {
    throw new Error('Required');
  }

  if (!isValidEmail(value)) {
    throw new Error('Must be a valid email');
  }

  return true;
}
