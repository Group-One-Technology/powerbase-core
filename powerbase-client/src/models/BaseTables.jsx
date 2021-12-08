import constate from 'constate';
import useSWR from 'swr';

import { getTables } from '@lib/api/tables';
import { useTableMigrationListener } from '@lib/hooks/websockets/useTableMigrationListener';
import { useAuthUser } from './AuthUser';

function useBaseTablesModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `${authUser.id}/databases/${id}/tables` : null,
    () => getTables({ databaseId: id }),
  );

  useTableMigrationListener({ tables: response.data?.tables, mutate: response.mutate });

  return {
    ...response,
    data: response.data?.tables,
  };
}

export const [BaseTablesProvider, useBaseTables] = constate(useBaseTablesModel);
