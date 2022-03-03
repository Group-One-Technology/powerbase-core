import { useEffect } from 'react';
import constate from 'constate';
import useSWR from 'swr';
import * as Sentry from '@sentry/react';
import { auth } from '@lib/api/auth';

function useAuthUserModel() {
  const response = useSWR('/auth', auth, { revalidateOnFocus: true });
  const authUser = response.data;

  useEffect(() => {
    Sentry.setUser({
      id: authUser?.id,
      name: authUser?.name,
      email: authUser?.email,
    });
  }, [authUser?.id]);

  return {
    authUser,
    ...response,
  };
}

export const [AuthUserProvider, useAuthUser] = constate(useAuthUserModel);
