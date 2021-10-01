import { useEffect, useState } from 'react';
import constate from 'constate';

function initializeSort(sort) {
  if (sort.id) {
    return {
      id: sort.id,
      value: sort.value?.map((item, index) => ({
        ...item,
        id: `${item.field}-${item.operator}-${index}`,
      })) || [],
    };
  }

  return {
    id: undefined,
    value: [],
  };
}

function useViewOptionsModel({ view }) {
  const [query, setQuery] = useState(view.query || '');
  const [filters, setFilters] = useState(view.filters);
  const [sort, setSort] = useState(initializeSort(view.sort));

  useEffect(() => {
    setFilters(view.filters);
  }, [view.id, view.filters]);

  useEffect(() => {
    setSort(initializeSort(view.sort));
  }, [view.id, view.sort]);

  return {
    viewId: view.id,
    query,
    setQuery,
    filters,
    setFilters,
    sort,
    setSort,
  };
}

export const [ViewOptionsProvider, useViewOptions] = constate(useViewOptionsModel);
