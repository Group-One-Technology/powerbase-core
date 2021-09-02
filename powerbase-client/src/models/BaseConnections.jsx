import constate from 'constate';
import useSWR from 'swr';

import { getBaseConnections } from '@lib/api/base-connections';
import { useAuthUser } from './AuthUser';

function useBaseConnectionsModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/tables/${id}/connections` : null,
    () => getBaseConnections({ tableId: id }),
  );

  return {
    ...response,
  };
}

export const [BaseConnectionsProvider, useBaseConnections] = constate(useBaseConnectionsModel);
