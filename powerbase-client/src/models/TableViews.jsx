import constate from 'constate';
import useSWR from 'swr';

import { getTableViews } from '@lib/api/views';
import { useAuthUser } from './AuthUser';

function useTableViewsModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/tables/${id}/views` : null,
    () => getTableViews({ tableId: id }),
  );

  return {
    tableId: id,
    ...response,
  };
}

export const [TableViewsProvider, useTableViews] = constate(useTableViewsModel);
