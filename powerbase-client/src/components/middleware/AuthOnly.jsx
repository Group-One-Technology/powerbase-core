import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthUser } from '@models/AuthUser';
import { Loader } from '@components/ui/Loader';

export function AuthOnly({ children }) {
  const history = useHistory();
  const location = useLocation();
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (!localStorage.signedIn) history.push('/login');
  }, [authUser]);

  if (authUser) {
    if (!authUser.isOnboarded && location.pathname !== '/onboarding') {
      history.push('/onboarding');
      return <Loader className="h-screen" />;
    }

    return <>{children}</>;
  }

  return <Loader className="h-screen" />;
}

AuthOnly.propTypes = {
  children: PropTypes.any,
};
