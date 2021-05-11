import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export function HomePage() {
  const history = useHistory();
  const authUser = null;

  useEffect(() => {
    if (authUser === null) {
      history.push('/login');
    }
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
