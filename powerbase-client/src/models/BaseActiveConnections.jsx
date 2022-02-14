import constate from 'constate';
import useSWR from 'swr';

import { getDatabaseActiveConnections } from '@lib/api/databases';
import { useAuthUser } from './AuthUser';

function useBaseActiveConnectionsModel({ baseId }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    authUser ? `/databases/${baseId}/active_connections` : null,
    () => getDatabaseActiveConnections({ id: baseId }),
  );

  return {
    ...response,
  };
}

export const [BaseActiveConnections, useBaseActiveConnections] = constate(useBaseActiveConnectionsModel);
