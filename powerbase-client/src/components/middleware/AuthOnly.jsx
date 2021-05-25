import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useAuthUser } from '@models/AuthUser';

export function AuthOnly({ children }) {
  const history = useHistory();
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (authUser === null || !localStorage.signedIn) history.push('/login');
  }, [authUser]);

  if (authUser) {
    return <>{children}</>;
  }

  return <div>Loading...</div>;
}

AuthOnly.propTypes = {
  children: PropTypes.any,
};
