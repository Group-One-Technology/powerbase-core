import { useEffect, useState } from 'react';
import constate from 'constate';

function useViewOptionsModel({ viewId, initialFilters }) {
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

export const [ViewOptionsProvider, useViewOptions] = constate(useViewOptionsModel);
