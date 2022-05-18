import useSWR from 'swr';
import constate from 'constate';

import { getHasAdmin } from '@lib/api/users';

function useHasAdminModel() {
  const response = useSWR('/users/has_admin', getHasAdmin);

  return {
    ...response,
    data: response.data?.hasAdmin,
  };
}

export const [HasAdminProvider, useHasAdmin] = constate(useHasAdminModel);
