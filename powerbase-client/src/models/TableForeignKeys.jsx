import constate from 'constate';
import useSWR from 'swr';

import { getTableForeignKeys } from '@lib/api/foreign-keys';
import { useAuthUser } from './AuthUser';

function useTableForeignKeysModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/tables/${id}/foreign_keys` : null,
    () => getTableForeignKeys({ tableId: id }),
  );

  return {
    ...response,
  };
}

export const [TableForeignKeysProvider, useTableForeignKeys] = constate(useTableForeignKeysModel);
