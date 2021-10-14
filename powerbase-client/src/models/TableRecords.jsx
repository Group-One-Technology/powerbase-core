import constate from 'constate';
import { useSWRInfinite } from 'swr';
import { useState } from 'react';
import { getTableRecords } from '@lib/api/records';
import { useAuthUser } from './AuthUser';
import { useRecordsFilter } from './views/RecordsFilter';

function getKey({
  index,
  tableId,
  filters,
  pageSize,
}) {
  const page = index + 1;
  const pageQuery = `page=${page}&limit=${pageSize}`;
  const filterQuery = filters?.id ? `&filterId=${filters?.id}` : '';

  return `/tables/${tableId}/records?${pageQuery}${filterQuery}`;
}

function useTableRecordsModel({ id, pageSize = 40 }) {
  const { authUser } = useAuthUser();
  const { filters, viewId } = useRecordsFilter();

  const response = useSWRInfinite(
    (index) => ((id && authUser && viewId)
      ? getKey({
        index,
        tableId: id,
        filters,
        pageSize,
      })
      : null),
    (url) => ((id && authUser && viewId)
      ? getTableRecords({
        url,
        filters: filters?.id
          ? filters?.value
          : undefined,
        viewId,
      })
      : undefined),
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
  const isReachingEnd = isEmpty || !!(data && (data[data.length - 1]?.length ?? 0) < pageSize);
  const loadMore = () => setSize((page) => page + 1);
  const [highlightedCell, setHighLightedCell] = useState(null);

  return {
    ...response,
    data: parsedData,
    isLoading,
    isReachingEnd,
    loadMore,
    highlightedCell,
    setHighLightedCell,
  };
}

export const [TableRecordsProvider, useTableRecords] = constate(useTableRecordsModel);
