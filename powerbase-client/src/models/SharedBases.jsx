import constate from 'constate';
import useSWR from 'swr';

import { getSharedDatabases } from '@lib/api/databases';
import { useMigrationListener } from '@lib/hooks/websockets/useMigrationListener';
import { useAuthUser } from './AuthUser';

function useSharedBasesModel() {
  const { authUser } = useAuthUser();

  const response = useSWR(
    authUser ? '/shared_databases' : null,
    getSharedDatabases,
  );

  useMigrationListener({ databases: response.data, mutate: response.mutate });

  return {
    ...response,
  };
}

export const [SharedBasesProvider, useSharedBases] = constate(useSharedBasesModel);
