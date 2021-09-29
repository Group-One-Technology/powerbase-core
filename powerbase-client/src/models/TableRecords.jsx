import constate from 'constate';
import { useSWRInfinite } from 'swr';

import { getTableRecords } from '@lib/api/records';
import { parseSortQueryString } from '@lib/helpers/sort/parseSortQueryString';
import { useAuthUser } from './AuthUser';
import { useViewOptions } from './views/ViewOptions';

function getKey({
  index,
  tableId,
  sort,
  filters,
  pageSize,
}) {
  const page = index + 1;
  const pageQuery = `page=${page}&limit=${pageSize}`;
  const filterQuery = filters?.id ? `&filterId=${filters?.id}` : '';
  const sortQuery = sort?.length ? `&sortId=${parseSortQueryString(sort)}` : '';

  return `/tables/${tableId}/records?${pageQuery}${filterQuery}${sortQuery}`;
}

function useTableRecordsModel({ id, pageSize = 40 }) {
  const { authUser } = useAuthUser();
  const { viewId, filters, sort } = useViewOptions();

  const response = useSWRInfinite(
    (index) => ((id && authUser && viewId)
      ? getKey({
        index,
        tableId: id,
        sort,
        filters,
        pageSize,
      })
      : null),
    (url) => ((id && authUser && viewId)
      ? getTableRecords({
        url,
        viewId,
        filters: filters?.id
          ? filters?.value
          : undefined,
        sort,
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

  return {
    ...response,
    data: parsedData,
    isLoading,
    isReachingEnd,
    loadMore,
  };
}

export const [TableRecordsProvider, useTableRecords] = constate(useTableRecordsModel);
