import { useState } from 'react';
import constate from 'constate';
import { useSWRInfinite } from 'swr';

import { getTableRecords } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

const PAGE_SIZE = 10;

function getKey({
  pageIndex,
  previousPageData,
  filters,
  tableId,
}) {
  if (previousPageData && !previousPageData.length) {
    return null;
  }

  const page = (pageIndex || 0) + 1;
  const pageQuery = `page=${page}&limit=${PAGE_SIZE}`;
  const filterQuery = filters?.id ? `&filterId=${filters?.id}` : '';

  return `/tables/${tableId}/records?${pageQuery}${filterQuery}`;
}

function useTableRecordsModel({ id, initialFilter }) {
  const { authUser } = useAuthUser();
  const [filters, setFilters] = useState(initialFilter);

  const response = useSWRInfinite(
    ({ pageIndex, previousPageData }) => ((id && authUser)
      ? getKey({
        pageIndex,
        previousPageData,
        tableId: id,
        filters,
      })
      : null),
    (url) => getTableRecords({ url, filters: filters?.value }),
  );

  const { data, error, size } = response;

  const parsedData = data && data?.reduce((previousValue, currentValue) => (
    previousValue?.concat(currentValue)
  ), []);
  const isLoadingInitialData = !data && !error;
  const isLoading = isLoadingInitialData
      || !!(size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || !!(data && (data[data.length - 1]?.length ?? 0) < PAGE_SIZE);

  return {
    ...response,
    filters,
    setFilters,
    data: parsedData,
    isLoading,
    isReachingEnd,
  };
}

export const [TableRecordsProvider, useTableRecords] = constate(useTableRecordsModel);
