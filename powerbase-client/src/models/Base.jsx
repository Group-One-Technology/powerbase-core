import { useEffect } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { useMigrationListener } from '@lib/hooks/websockets/useMigrationListener';
import { getDatabase } from '@lib/api/databases';
import { useAuthUser } from './AuthUser';

function useBaseModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/databases/${id}` : null,
    () => getDatabase({ id }),
  );

  const { migrationListener } = useMigrationListener({ mutate: response.mutate });

  useEffect(() => {
    migrationListener(id);
  }, [id]);

  return {
    ...response,
  };
}

export const [BaseProvider, useBase] = constate(useBaseModel);
