import constate from 'constate';
import useSWR from 'swr';

import { getTableView } from '@lib/api/views';
import { useAuthUser } from './AuthUser';

function useTableViewModel({ id, initialData }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/views/${id}` : null,
    () => getTableView({ id }),
    { initialData },
  );

  return {
    tableId: id,
    ...response,
  };
}

export const [TableViewProvider, useTableView] = constate(useTableViewModel);
