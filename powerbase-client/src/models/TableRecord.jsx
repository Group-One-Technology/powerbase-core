import useSWR from 'swr';
import constate from 'constate';

import { getTableRecord } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

function useTableRecordModel({ tableId, recordId, primaryKeys }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (tableId && recordId && authUser) ? `/tables/${tableId}/records/${recordId}` : null,
    () => ((tableId && authUser && recordId && primaryKeys)
      ? getTableRecord({ tableId, recordId, primary_keys: primaryKeys })
      : undefined),
  );

  return {
    ...response,
  };
}

export const [TableRecordProvider, useTableRecord] = constate(useTableRecordModel);
