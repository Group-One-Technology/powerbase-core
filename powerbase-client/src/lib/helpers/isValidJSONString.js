/**
 * Checks whether given json string is valid or not.
 * https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
 * @param {string} string a JSON string
 * @returns boolean
 */
export function isValidJSONString(string) {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
}
