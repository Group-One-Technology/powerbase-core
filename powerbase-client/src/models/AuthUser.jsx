import { useState } from 'react';
import constate from 'constate';

// TODO: Add authentication logic
function useAuthUserModel() {
  const [authUser, setAuthUser] = useState(null);

  return { authUser, setAuthUser };
}

export const [AuthUserProvider, useAuthUser] = constate(useAuthUserModel);
