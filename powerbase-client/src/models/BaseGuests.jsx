import { useState, useEffect } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getGuests } from '@lib/api/guests';
import { useAuthUser } from './AuthUser';

const REFRESH_INTERVAL = 15000; // milliseconds = 15 seconds

function useBaseGuestsModel({ id }) {
  const { authUser } = useAuthUser();
  const [refreshInterval, setRefeshInterval] = useState(0);

  const response = useSWR(
    (id && authUser) ? `/databases/${id}/guests` : null,
    () => getGuests({ databaseId: id }),
    { refreshInterval },
  );

  const notSyncedGuests = response.data?.filter((item) => !item.isSynced);

  useEffect(() => {
    if (notSyncedGuests?.length > 0) {
      setRefeshInterval(REFRESH_INTERVAL);
    } else if (refreshInterval > 0) {
      setRefeshInterval(0);
    }
  }, [notSyncedGuests]);

  return {
    ...response,
  };
}

export const [BaseGuestsProvider, useBaseGuests] = constate(useBaseGuestsModel);
