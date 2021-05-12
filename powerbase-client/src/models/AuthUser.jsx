import { useState } from 'react';
import constate from 'constate';

// TODO: Add authentication logic
function useAuthUserModel() {
  const [user, setUser] = useState(null);

  return { user, setUser };
}

export const [AuthUserProvider, useAuthUser] = constate(useAuthUserModel);
