/**
 * Checks whether the given word starts with a vowel or not.
 * @param {string} word
 * @returns boolean
 */
export function startsWithVowel(string) {
  return ['a', 'e', 'i', 'o', 'u'].includes(string[0].toLowerCase());
}
