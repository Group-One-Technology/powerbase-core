import { useEffect, useState } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getDatabases } from '@lib/api/databases';
import { useAuthUser } from './AuthUser';

const REFRESH_INTERVAL = 5000; // milliseconds = 5 seconds

function useBasesModel() {
  const { authUser } = useAuthUser();
  const [refreshInterval, setRefeshInterval] = useState(0);

  const response = useSWR(
    authUser ? '/databases' : null,
    getDatabases,
    { revalidateOnFocus: true, refreshInterval },
  );

  useEffect(() => {
    const migratingNonTurboBases = response.data?.filter((item) => !item.isMigrated && !item.isTurbo);

    if (migratingNonTurboBases?.length > 0 && refreshInterval === 0) {
      setRefeshInterval(REFRESH_INTERVAL);
    } else if (refreshInterval > 0) {
      setRefeshInterval(0);
    }
  }, [response.data]);

  return {
    ...response,
  };
}

export const [BasesProvider, useBases] = constate(useBasesModel);
