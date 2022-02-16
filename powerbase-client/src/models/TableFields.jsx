import constate from 'constate';
import useSWR from 'swr';

import { getTableFields } from '@lib/api/fields';
import { useAuthUser } from './AuthUser';

function useTableFieldsModel({ tableId }) {
  const { authUser } = useAuthUser();

  const response = useSWR(
    (tableId && authUser) ? `/tables/${tableId}/fields` : null,
    () => getTableFields({ tableId }),
  );

  return {
    ...response,
  };
}

export const [TableFieldsProvider, useTableFields] = constate(useTableFieldsModel);
