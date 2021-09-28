import constate from 'constate';
import useSWR from 'swr';

import { getTableRecordsCount } from '@lib/api/records';
import { useAuthUser } from './AuthUser';
import { useViewOptions } from './views/ViewOptions';

function useTableRecordsCountModel({ id }) {
  const { authUser } = useAuthUser();
  const { filters, viewId } = useViewOptions();

  const filterQuery = filters?.id ? `filterId=${filters?.id}` : '';

  const response = useSWR(
    (id && authUser && viewId) ? `/tables/${id}/records_count?${filterQuery}` : null,
    () => ((id && authUser && viewId)
      ? getTableRecordsCount({
        tableId: id,
        filters: filters?.id
          ? filters?.value
          : undefined,
      })
      : undefined),
  );

  return {
    ...response,
    data: response.data?.count,
  };
}

export const [
  TableRecordsCountProvider,
  useTableRecordsCount,
] = constate(useTableRecordsCountModel);
