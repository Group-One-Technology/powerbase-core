import { isValidDomain } from '@lib/helpers/isValidDomain';

/**
 * Validates an email input.
 *
 * @param {string} value The email that has been inputted by the user.
 * @returns boolean - check whether the input is valid or not.
 */
export function DOMAIN_VALIDATOR(value) {
  if (!value) {
    throw new Error('Required');
  }

  if (!isValidDomain(value)) {
    throw new Error('Must be a valid domain');
  }

  return true;
}
