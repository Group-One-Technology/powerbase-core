import { useEffect, useState } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getTableRecordsCount } from '@lib/api/records';
import { useAuthUser } from './AuthUser';
import { useViewOptions } from './views/ViewOptions';

function useTableRecordsCountModel({ id, isVirtual }) {
  const { authUser } = useAuthUser();
  const { query, filters, viewId } = useViewOptions();

  const searchQuery = query?.length ? `q=${encodeURIComponent(query)}` : '';
  const filterQuery = filters?.id ? `&filterId=${filters?.id}` : '';

  const response = useSWR(
    id && authUser && viewId
      ? `/tables/${id}/records_count?${searchQuery}${filterQuery}`
      : null,
    () => (id && authUser && viewId
      ? getTableRecordsCount({
        tableId: id,
        query,
        filters: filters?.id ? filters?.value : undefined,
        isVirtual,
      })
      : undefined),
  );

  const [totalRecords, setTotalRecords] = useState(response.data?.count);

  useEffect(() => {
    setTotalRecords(response.data?.count);
  }, [response.data]);

  return {
    ...response,
    data: totalRecords,
    setTotalRecords,
  };
}

export const [TableRecordsCountProvider, useTableRecordsCount] = constate(
  useTableRecordsCountModel,
);
