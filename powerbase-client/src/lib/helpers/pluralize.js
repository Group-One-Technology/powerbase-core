/**
 * Pluralizes the given word based on the given count.
 * @param {string} word singular form of the word.
 * @param {number} count basis for the pluralization.
 * @returns string
 */
export function pluralize(word, count) {
  return count !== 1
    ? `${count} ${word}s`
    : `${count} ${word}`;
}
