import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthUser } from '@models/AuthUser';

export function HomePage() {
  const history = useHistory();
  const authUser = useAuthUser();

  useEffect(() => {
    if (authUser === null) history.push('/login');
  }, [authUser]);

  if (authUser) {
    return (
      <div>
        Home Page
      </div>
    );
  }

  return null;
}
