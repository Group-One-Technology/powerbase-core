export function parseQueryString(filter) {
  const { level, operator, filters } = filter;

  const queryString = filters
    ?.map((item) => {
      if (item.operator) {
        return parseQueryString(item);
      }

      if (item.field && item.filter.operator && (item.filter.value !== '' || typeof item.filter.value !== 'undefined')) {
        return `${item.field}:${item.filter.operator}${item.filter.value}`;
      }

      return undefined;
    })
    .filter((item) => item)
    .join(` ${operator} `);

  return level === 0 ? queryString : `(${queryString})`;
}
