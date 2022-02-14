import constate from 'constate';
import useSWR from 'swr';

import { getDatabaseConnectionStats } from '@lib/api/databases';
import { useAuthUser } from './AuthUser';

function useBaseConnectionStatsModel({ baseId }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    authUser ? `/databases/${baseId}/active_connections` : null,
    () => getDatabaseConnectionStats({ id: baseId }),
  );

  return {
    ...response,
  };
}

export const [BaseConnectionStatsProvider, useBaseConnectionStats] = constate(useBaseConnectionStatsModel);
