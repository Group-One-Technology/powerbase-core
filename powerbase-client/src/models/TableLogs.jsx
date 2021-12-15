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

  const { fieldMigrationListener, notifierMigrationListener } = useTableMigrationListener({ mutate: response.mutate });

  useEffect(() => {
    if (id) {
      fieldMigrationListener(id);
      notifierMigrationListener(id);
    }
  }, [id]);

  return {
    ...response,
  };
}

export const [TableLogsProvider, useTableLogs] = constate(useTableLogsModel);
