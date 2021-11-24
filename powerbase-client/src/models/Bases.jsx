import { useEffect, useState } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getDatabases } from '@lib/api/databases';
import { NON_TURBO_REFRESH_INTERVAL, TURBO_REFRESH_INTERVAL } from '@lib/constants/bases';
import { useAuthUser } from './AuthUser';

function useBasesModel() {
  const { authUser } = useAuthUser();
  const [refreshInterval, setRefeshInterval] = useState(0);

  const response = useSWR(
    authUser ? '/databases' : null,
    getDatabases,
    { revalidateOnFocus: true, refreshInterval },
  );

  useEffect(() => {
    const migratingBases = response.data?.filter((item) => !item.isMigrated);
    const hasNonTurboBases = migratingBases?.some((item) => !item.isTurbo) || false;
    const updatedRefreshInterval = hasNonTurboBases
      ? NON_TURBO_REFRESH_INTERVAL
      : TURBO_REFRESH_INTERVAL;

    if (migratingBases?.length > 0 && refreshInterval !== updatedRefreshInterval) {
      setRefeshInterval(updatedRefreshInterval);
    } else if (refreshInterval > 0) {
      setRefeshInterval(0);
    }
  }, [response.data]);

  return {
    ...response,
  };
}

export const [BasesProvider, useBases] = constate(useBasesModel);
