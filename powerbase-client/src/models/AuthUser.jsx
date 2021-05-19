import { useState } from 'react';
import constate from 'constate';

// TODO: Add authentication logic
function useAuthUserModel() {
  const [tokens, setTokens] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  return {
    tokens,
    setTokens,
    authUser,
    setAuthUser,
  };
}

export const [AuthUserProvider, useAuthUser] = constate(useAuthUserModel);
