import { useEffect, useState } from 'react';
import constate from 'constate';

function useRecordsFilterModel({ viewId, initialFilters }) {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    viewId,
    filters,
    setFilters,
  };
}

export const [RecordsFilterProvider, useRecordsFilter] = constate(useRecordsFilterModel);
