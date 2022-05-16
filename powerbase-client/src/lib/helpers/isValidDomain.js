const regex = /^(((?!-))(xn--)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9-]{1,61}|[a-z0-9-]{1,30})\.[a-z]{2,}$/;

/**
 *
 * Checks whether given domain is valid or not.
 * @param {string} domain
 * @returns boolean
 */
export function isValidDomain(domain) {
  return regex.test(String(domain).toLowerCase());
}
