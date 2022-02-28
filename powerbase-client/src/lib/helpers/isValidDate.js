/**
 * Checks whether given date object is valid or not.
 * https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
 * @param {object} date
 * @returns boolean
 */
export function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}
