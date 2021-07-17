import { useState } from 'react';
import constate from 'constate';

function useRecordsFilterModel({ viewId, initialFilters }) {
  const [filters, setFilters] = useState(initialFilters);

  return {
    viewId,
    filters,
    setFilters,
  };
}

export const [RecordsFilterProvider, useRecordsFilter] = constate(useRecordsFilterModel);
