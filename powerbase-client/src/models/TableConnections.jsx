import constate from 'constate';
import useSWR from 'swr';

import { getBaseConnections } from '@lib/api/base-connections';
import { useAuthUser } from './AuthUser';

function useTableConnectionsModel({ tableId }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (tableId && authUser) ? `/tables/${tableId}/connections` : null,
    () => getBaseConnections({ tableId }),
  );

  return {
    ...response,
  };
}

export const [TableConnectionsProvider, useTableConnections] = constate(useTableConnectionsModel);
