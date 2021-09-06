import constate from 'constate';
import useSWR from 'swr';

import { getTableReferencedConnections } from '@lib/api/base-connections';
import { useAuthUser } from './AuthUser';

function uesTableReferencedConnectionsModel({ tableId }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (tableId && authUser) ? `/tables/${tableId}/referenced_connections` : null,
    () => getTableReferencedConnections({ tableId }),
  );

  return {
    ...response,
  };
}

export const [TableReferencedConnectionsProvider, useTableReferencedConnections] = constate(uesTableReferencedConnectionsModel);
