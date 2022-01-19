function extractFieldFromFilters(filters) {
  return filters?.reduce((fieldNames, item) => (item.operator && item.filters?.length
    ? [...fieldNames, ...extractFieldFromFilters(item.filters)]
    : item.field
      ? [...fieldNames, item.field]
      : fieldNames), []);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export function getFilterFieldNames(initialFilter, { unique = true } = {}) {
  const fieldNames = extractFieldFromFilters(initialFilter?.filters);
  if (unique) return fieldNames.filter(onlyUnique);
  return fieldNames;
}
