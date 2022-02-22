import { useState } from 'react';
import constate from 'constate';
import useSWR from 'swr';
import queryString from 'query-string';

import { getDatabaseConnectionStats } from '@lib/api/databases';
import { useAuthUser } from './AuthUser';

function useBaseConnectionStatsModel({ baseId }) {
  const { authUser } = useAuthUser();
  const [filter, setFilter] = useState('all');
  const params = queryString.stringify({ filter });

  const response = useSWR(
    authUser ? `/databases/${baseId}/connection_stats?${params}}` : null,
    () => getDatabaseConnectionStats({ id: baseId, params }),
  );

  return {
    ...response,
    filter,
    setFilter,
  };
}

export const [BaseConnectionStatsProvider, useBaseConnectionStats] = constate(useBaseConnectionStatsModel);
