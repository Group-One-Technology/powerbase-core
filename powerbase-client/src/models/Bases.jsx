import constate from 'constate';
import useSWR from 'swr';

import { getDatabases } from '@lib/api/databases';
import { useAuthUser } from './AuthUser';

function useBasesModel() {
  const { authUser } = useAuthUser();

  const response = useSWR(authUser ? '/databases' : null, getDatabases);

  return {
    ...response,
  };
}

export const [BasesProvider, useBases] = constate(useBasesModel);
