import constate from 'constate';
import useSWR from 'swr';

import { getTableFields } from '@lib/api/fields';
import { useAuthUser } from './AuthUser';

function useTableFieldsModel({ id }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (id && authUser) ? `/tables/${id}/fields` : null,
    () => getTableFields({ tableId: id }),
  );

  return {
    ...response,
  };
}

export const [TableFieldsProvider, useTableFields] = constate(useTableFieldsModel);
