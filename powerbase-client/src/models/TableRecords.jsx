/* eslint-disable max-len */
import { useState } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getTableRecords } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

function useTableRecordsModel({ id, initialFilter }) {
  const { authUser } = useAuthUser();
  const initialOperator = initialFilter
    ? Object.keys(initialFilter)[0]
    : undefined;
  const [filters, setFilters] = useState(initialFilter && initialOperator
    ? ({
      id: `${initialFilter[initialOperator][0].field}:${initialOperator}=${initialFilter[initialOperator][1].value}`,
      value: initialFilter,
    })
    : undefined);

  const response = useSWR(
    (id && authUser) ? `/tables/${id}/records?${filters?.id}` : null,
    () => getTableRecords({ tableId: id, filters: filters?.value }),
  );

  return {
    filters,
    setFilters,
    ...response,
  };
}

export const [TableRecordsProvider, useTableRecords] = constate(useTableRecordsModel);
