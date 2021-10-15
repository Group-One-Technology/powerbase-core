export function parseSortQueryString(sort) {
  return sort.map((item) => `${item.field}_${item.operator}`).join('-');
}
