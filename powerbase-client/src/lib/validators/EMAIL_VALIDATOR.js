const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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

  if (!regex.test(String(value).toLowerCase())) {
    throw new Error('Must be a valid email');
  }

  return true;
}
