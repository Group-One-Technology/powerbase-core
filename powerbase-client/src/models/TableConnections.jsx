import { useEffect } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getTableConnections } from '@lib/api/base-connections';
import { useTableMigrationListener } from '@lib/hooks/websockets/useTableMigrationListener';
import { useAuthUser } from './AuthUser';

function useTableConnectionsModel({ tableId }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (tableId && authUser) ? `/tables/${tableId}/connections` : null,
    () => getTableConnections({ tableId }),
  );

  const { connectionMigrationListener } = useTableMigrationListener({ mutate: response.mutate });

  useEffect(() => {
    if (tableId) {
      connectionMigrationListener(tableId);
    }
  }, [tableId]);

  return {
    ...response,
  };
}

export const [TableConnectionsProvider, useTableConnections] = constate(useTableConnectionsModel);
