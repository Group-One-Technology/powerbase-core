import constate from 'constate';
import useSWR from 'swr';

import { getTableRecords } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

function useTableRecordsModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/tables/${id}/records` : null,
    () => getTableRecords({ tableId: id }),
  );

  return {
    ...response,
  };
}

export const [TableRecordsProvider, useTableRecords] = constate(useTableRecordsModel);
