import { useEffect } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getTable } from '@lib/api/tables';
import { useTableMigrationListener } from '@lib/hooks/websockets/useTableMigrationListener';
import { useAuthUser } from './AuthUser';

function useBaseTableModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/table/${id}` : null,
    () => getTable({ id }),
  );

  const { migrationListener } = useTableMigrationListener({ tables: response.data?.tables, mutate: response.mutate });

  useEffect(() => {
    if (response.data && !response.data.isMigrated) {
      migrationListener(response.data.id);
    }
  }, [response.data]);

  return {
    ...response,
  };
}

export const [BaseTableProvider, useBaseTable] = constate(useBaseTableModel);
