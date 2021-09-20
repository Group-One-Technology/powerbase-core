export function buildFilterTree(curFilter, filters) {
  const childFilters = filters.filter((item) => item.level === curFilter.level + 1)
    .map((item) => (item.operator
      ? buildFilterTree(item, filters)
      : {
        level: item.level,
        field: item.filter.field,
        filter: item.filter.filter,
      }));

  Object.keys(curFilter)
    .forEach((key) => (curFilter[key] === undefined || curFilter[key] === ''
      ? delete curFilter[key]
      : {}));

  return {
    ...curFilter,
    filters: childFilters,
  };
}
