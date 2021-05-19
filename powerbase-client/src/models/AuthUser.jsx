import { useState } from 'react';
import constate from 'constate';
import useSWR from 'swr';
import { auth } from '@lib/api/auth';

// TODO: Add authentication logic
function useAuthUserModel() {
  const response = useSWR('/auth', auth);

  return {
    authUser: response.data,
    ...response,
  };
}

export const [AuthUserProvider, useAuthUser] = constate(useAuthUserModel);
