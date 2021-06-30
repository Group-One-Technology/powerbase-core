import { useState } from 'react';
import constate from 'constate';
import { useSWRInfinite } from 'swr';

import { getTableRecords } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

const PAGE_SIZE = 1000;

function getKey({ index, tableId, filters }) {
  const page = index + 1;
  const pageQuery = `page=${page}&limit=${PAGE_SIZE}`;
  const filterQuery = filters?.id ? `&filterId=${filters?.id}` : '';

  return `/tables/${tableId}/records?${pageQuery}${filterQuery}`;
}

function useTableRecordsModel({ id, initialFilter }) {
  const { authUser } = useAuthUser();
  const [filters, setFilters] = useState(initialFilter);

  const response = useSWRInfinite(
    (index) => ((id && authUser)
      ? getKey({
        index,
        tableId: id,
        filters,
      })
      : null),
    (url) => getTableRecords({ url, filters: filters?.value }),
  );

  const {
    data,
    error,
    size,
    setSize,
  } = response;

  const parsedData = data && data?.reduce((prev, cur) => prev?.concat(cur), []);
  const isLoadingInitialData = !data && !error;
  const isLoading = isLoadingInitialData
      || !!(size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || !!(data && (data[data.length - 1]?.length ?? 0) < PAGE_SIZE);
  const loadMore = () => setSize((page) => page + 1);

  return {
    ...response,
    filters,
    setFilters,
    data: parsedData,
    isLoading,
    isReachingEnd,
    loadMore,
  };
}

export const [TableRecordsProvider, useTableRecords] = constate(useTableRecordsModel);
