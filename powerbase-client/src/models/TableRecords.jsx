import { useState } from 'react';
import constate from 'constate';
import useSWR from 'swr';
import queryString from 'query-string';

import { getTableRecords } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

function useTableRecordsModel({ id }) {
  const { authUser } = useAuthUser();
  const [filters, setFilters] = useState();

  const response = useSWR(
    (id && authUser) ? `/tables/${id}/records?${queryString.stringify(filters)}` : null,
    () => getTableRecords({ tableId: id, filters }),
  );

  return {
    filters,
    setFilters,
    ...response,
  };
}

export const [TableRecordsProvider, useTableRecords] = constate(useTableRecordsModel);
