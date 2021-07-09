import { useState } from 'react';
import constate from 'constate';

function useRecordsFilterModel({ initialFilters }) {
  const [filters, setFilters] = useState(initialFilters);

  return {
    filters,
    setFilters,
  };
}

export const [RecordsFilterProvider, useRecordsFilter] = constate(useRecordsFilterModel);
