import { useEffect } from 'react';
import constate from 'constate';
import useSWR from 'swr';

import { getTableLogs } from '@lib/api/tables';
import { useTableMigrationListener } from '@lib/hooks/websockets/useTableMigrationListener';
import { useAuthUser } from './AuthUser';

function useTableLogsModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/table/${id}/logs` : null,
    () => getTableLogs({ id }),
  );

  const { fieldMigrationListener } = useTableMigrationListener({ mutate: response.mutate });

  useEffect(() => {
    if (response.data && !response.data.isMigrated) {
      fieldMigrationListener(response.data.id);
    }
  }, [response.data]);

  return {
    ...response,
  };
}

export const [TableLogsProvider, useTableLogs] = constate(useTableLogsModel);
