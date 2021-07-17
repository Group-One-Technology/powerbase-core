import constate from 'constate';
import useSWR from 'swr';

import { getTableRecordsCount } from '@lib/api/records';
import { useAuthUser } from './AuthUser';
import { useRecordsFilter } from './views/RecordsFilter';

function useTableRecordsCountModel({ id }) {
  const { authUser } = useAuthUser();
  const { filters, viewId } = useRecordsFilter();

  const filterQuery = filters?.id ? `filterId=${filters?.id}` : '';

  const response = useSWR(
    (id && authUser && viewId) ? `/tables/${id}/records_count?${filterQuery}` : null,
    () => getTableRecordsCount({ tableId: id, filters: filters?.value }),
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
