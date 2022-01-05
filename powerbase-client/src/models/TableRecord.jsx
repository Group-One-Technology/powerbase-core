import useSWR from 'swr';
import constate from 'constate';
import queryString from 'query-string';

import { getTableRecord } from '@lib/api/records';
import { useAuthUser } from './AuthUser';

function useTableRecordModel({
  tableId,
  recordId,
  primaryKeys,
  includePii,
}) {
  const { authUser } = useAuthUser();
  const params = queryString.stringify({
    include_pii: !!includePii,
  });

  const response = useSWR(
    (tableId && recordId && authUser) ? `/tables/${tableId}/records/${recordId}?${params}` : null,
    () => ((tableId && authUser && recordId && primaryKeys)
      ? getTableRecord({
        tableId,
        recordId,
        primary_keys: primaryKeys,
        include_pii: !!includePii,
      })
      : undefined),
  );

  return {
    ...response,
  };
}

export const [TableRecordProvider, useTableRecord] = constate(useTableRecordModel);
