import constate from 'constate';
import useSWR from 'swr';

import { getGuests } from '@lib/api/guests';
import { useAuthUser } from './AuthUser';

function useBaseGuestsModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/databases/${id}/guests` : null,
    () => getGuests({ databaseId: id }),
  );

  return {
    ...response,
  };
}

export const [BaseGuestsProvider, useBaseGuests] = constate(useBaseGuestsModel);
