import constate from 'constate';
import { useSWRInfinite } from 'swr';

import { getTableRecords } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

function getKey({
  index, tableId, filterKey, pageSize,
}) {
  const page = index + 1;
  const pageQuery = `page=${page}&limit=${pageSize}`;

  return `/tables/${tableId}/linked_records?${pageQuery}&${filterKey}`;
}

function useTableLinkedRecordsModel({ tableId, pageSize = 5, filters }) {
  const { authUser } = useAuthUser();

  const filterKey = Object.entries(filters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const response = useSWRInfinite(
    (index) => (filterKey && authUser
      ? getKey({
        index,
        tableId,
        filterKey,
        pageSize,
      })
      : null),
    (url) => (filterKey && authUser ? getTableRecords({ url, filters }) : undefined),
  );

  const {
    data, error, size, setSize,
  } = response;

  const parsedData = data && data?.reduce((prev, cur) => prev?.concat(cur), []);
  const isLoadingInitialData = !data && !error;
  const isLoading = isLoadingInitialData
    || !!(size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || !!(data && (data[data.length - 1]?.length ?? 0) < pageSize);
  const loadMore = () => setSize((page) => page + 1);

  return {
    ...response,
    data: parsedData,
    isLoading,
    isReachingEnd,
    loadMore,
  };
}

export const [TableLinkedRecordsProvider, useTableLinkedRecords] = constate(
  useTableLinkedRecordsModel,
);
