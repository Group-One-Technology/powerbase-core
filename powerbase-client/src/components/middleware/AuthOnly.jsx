import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useAuthUser } from '@models/AuthUser';
import { Loader } from '@components/ui/Loader';

export function AuthOnly({ children }) {
  const history = useHistory();
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (!localStorage.signedIn) history.push('/login');
  }, [authUser]);

  if (authUser) {
    return <>{children}</>;
  }

  return <Loader className="h-screen" />;
}

AuthOnly.propTypes = {
  children: PropTypes.any,
};
