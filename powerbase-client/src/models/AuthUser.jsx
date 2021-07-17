import constate from 'constate';
import useSWR from 'swr';
import { auth } from '@lib/api/auth';

function useAuthUserModel() {
  const response = useSWR('/auth', auth, { revalidateOnFocus: true });

  return {
    authUser: response.data,
    ...response,
  };
}

export const [AuthUserProvider, useAuthUser] = constate(useAuthUserModel);
