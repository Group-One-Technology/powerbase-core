import constate from 'constate';
import useSWR from 'swr';

import { getDatabases } from '@lib/api/databases';
import { useMigrationListener } from '@lib/hooks/websockets/useMigrationListener';
import { useAuthUser } from './AuthUser';

function useBasesModel() {
  const { authUser } = useAuthUser();

  const response = useSWR(
    authUser ? '/databases' : null,
    getDatabases,
  );

  useMigrationListener({ databases: response.data, mutate: response.mutate });

  return {
    ...response,
  };
}

export const [BasesProvider, useBases] = constate(useBasesModel);
