/**
 * Case-insensitively access a property on a given object and retrieves its value.
 * @param {object} object the object to be accessed.
 * @param {searchKey} searchKey the key to use for the case-insensitive property access.
 * @returns string
 */

export function getParameterCaseInsensitive(object, searchKey) {
  return object[
    Object.keys(object).find((k) => k.toLowerCase() === searchKey.toLowerCase())
  ];
}
