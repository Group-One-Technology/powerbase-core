import constate from 'constate';
import useSWR from 'swr';

import { getTableConnections } from '@lib/api/base-connections';
import { useAuthUser } from './AuthUser';

function useTableConnectionsModel({ tableId }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (tableId && authUser) ? `/tables/${tableId}/connections` : null,
    () => getTableConnections({ tableId }),
  );

  return {
    ...response,
  };
}

export const [TableConnectionsProvider, useTableConnections] = constate(useTableConnectionsModel);
