/**
 * Checks whether given url is valid or not.
 * https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
 * @param {string} url
 * @returns boolean
 */
export function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
