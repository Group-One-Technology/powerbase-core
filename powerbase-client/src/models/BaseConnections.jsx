import constate from 'constate';
import useSWR from 'swr';

import { getBaseConnections } from '@lib/api/base-connections';
import { useAuthUser } from './AuthUser';

function useBaseConnectionsModel({ baseId }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (baseId && authUser) ? `/databases/${baseId}/connections` : null,
    () => getBaseConnections({ baseId }),
  );

  return {
    ...response,
  };
}

export const [BaseConnectionsProvider, useBaseConnections] = constate(useBaseConnectionsModel);
