import constate from 'constate';
import useSWR from 'swr';

import { getTableRecordsCount } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

function useTableRecordsCountModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/tables/${id}/records_count` : null,
    () => getTableRecordsCount({ tableId: id }),
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
