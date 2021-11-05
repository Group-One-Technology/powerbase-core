import useSWR from 'swr';
import constate from 'constate';

import { useBase } from '@models/Base';
import { useAuthUser } from '@models/AuthUser';
import { getAuthGuestByDatabase } from '@lib/api/auth';

function useBaseUserModel() {
  const { authUser } = useAuthUser();
  const { data: base } = useBase();

  const response = useSWR(
    (base && authUser) ? `/auth/databases/${base.id}/guest` : null,
    () => getAuthGuestByDatabase({ databaseId: base.id }),
  );

  return {
    ...response,
    authUser,
    access: response.data?.permissions,
  };
}

export const [BaseUserProvider, useBaseUser] = constate(useBaseUserModel);
