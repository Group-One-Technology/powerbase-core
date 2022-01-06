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
  const params = {
    include_pii: !!includePii,
    include_json: true,
  };

  const response = useSWR(
    (tableId && recordId && authUser) ? `/tables/${tableId}/records/${recordId}?${queryString.stringify(params)}` : null,
    () => ((tableId && authUser && recordId && primaryKeys)
      ? getTableRecord({
        tableId,
        recordId,
        primary_keys: primaryKeys,
        ...params,
      })
      : undefined),
  );

  return {
    ...response,
  };
}

export const [TableRecordProvider, useTableRecord] = constate(useTableRecordModel);
