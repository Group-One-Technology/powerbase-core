import { useEffect, useState } from 'react';
import constate from 'constate';

function useViewOptionsModel({ viewId, initialFilters, initialSort }) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort?.map((item, index) => ({
    ...item,
    id: `${item.field}-${item.operator}-${index}`,
  })) || []);

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
