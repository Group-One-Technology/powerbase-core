import constate from 'constate';
import useSWR from 'swr';

import { getDatabase } from '@lib/api/databases';
import { useAuthUser } from './AuthUser';

function useBaseModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/databases/${id}` : null,
    () => getDatabase({ id }),
  );

  return {
    ...response,
  };
}

export const [BaseProvider, useBase] = constate(useBaseModel);
