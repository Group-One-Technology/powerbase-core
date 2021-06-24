import constate from 'constate';
import useSWR from 'swr';

import { getTableView } from '@lib/api/views';
import { useAuthUser } from './AuthUser';

function useTableViewModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/views/${id}` : null,
    () => getTableView({ id }),
  );

  return {
    tableId: id,
    ...response,
  };
}

export const [TableViewProvider, useTableView] = constate(useTableViewModel);
