import constate from 'constate';
import useSWR from 'swr';

import { getTable } from '@lib/api/tables';
import { useAuthUser } from './AuthUser';

function useBaseTableModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/table/${id}` : null,
    () => getTable({ id }),
  );

  return {
    ...response,
  };
}

export const [BaseTableProvider, useBaseTable] = constate(useBaseTableModel);
