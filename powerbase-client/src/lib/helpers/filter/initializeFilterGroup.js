export function initializeFilterGroup({ id, filterGroup, fields }) {
  if (filterGroup) {
    return ({
      ...filterGroup,
      filters: filterGroup.filters.map((item, index) => {
        if (item.filters?.length) {
          const filterId = `${id}-${item.operator}-filter${index}`;

          return ({
            ...item,
            id: filterId,
          });
        }

        const filterId = (item.filter && item.filter.operator && item.filter.value)
          ? `${id}-${item.field}:${item.filter.operator}${item.filter.value}-filter${index}`
          : item.id || `${id}-${fields[0].name}-filter-${index}`;

        return ({
          ...item,
          id: filterId,
        });
      }),
    });
  }

  return ({
    operator: 'and',
    filters: [{
      id: `${id}-${fields[0].name}-filter-0`,
      field: fields[0].name,
    }],
  });
}
