const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 *
 * Checks whether given email is valid or not.
 * @param {string} email
 * @returns boolean
 */
export function isValidEmail(email) {
  return regex.test(String(email).toLowerCase());
}
