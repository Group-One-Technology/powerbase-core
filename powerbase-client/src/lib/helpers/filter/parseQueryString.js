export function parseQueryString(filter) {
  const { operator, filters } = filter;

  const queryString = filters
    ?.map((item) => (item.operator
      ? parseQueryString(item)
      : `${item.field}:${item.filter.operator}${item.filter.value}`))
    .join(` ${operator} `);

  return `(${queryString})`;
}
