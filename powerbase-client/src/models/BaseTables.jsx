import { useEffect } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getTables } from '@lib/api/tables';
import { useTableMigrationListener } from '@lib/hooks/websockets/useTableMigrationListener';
import { useMigrationListener } from '@lib/hooks/websockets/useMigrationListener';
import { useAuthUser } from './AuthUser';

function useBaseTablesModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `${authUser.id}/databases/${id}/tables` : null,
    () => getTables({ databaseId: id }),
  );

  const { migrationListener } = useMigrationListener({ mutate: response.mutate });
  useTableMigrationListener({ tables: response.data?.tables, mutate: response.mutate });

  useEffect(() => {
    migrationListener(id);
  }, [id]);

  return {
    ...response,
  };
}

export const [BaseTablesProvider, useBaseTables] = constate(useBaseTablesModel);
