import React from 'react';
import PropTypes from 'prop-types';
import { AuthUserProvider } from '@models/AuthUser';

export function GlobalProviders({ children }) {
  return (
    <AuthUserProvider>
      {children}
    </AuthUserProvider>
  );
}

GlobalProviders.propTypes = {
  children: PropTypes.element.isRequired,
};
