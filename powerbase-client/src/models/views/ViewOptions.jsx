import { useEffect, useState } from 'react';
import constate from 'constate';

const SORT = [
  { field: 'id', operator: 'ascending' },
  { field: 'title', operator: 'descending' },
];

function useViewOptionsModel({ viewId, initialFilters, initialSort = SORT }) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setSort(sort);
  }, [initialSort]);

  return {
    viewId,
    filters,
    setFilters,
    sort,
    setSort,
  };
}

export const [ViewOptionsProvider, useViewOptions] = constate(useViewOptionsModel);
