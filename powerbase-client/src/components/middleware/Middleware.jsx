import React from 'react';
import PropTypes from 'prop-types';
import { AuthOnly } from './AuthOnly';

export function Middleware({ children, authOnly }) {
  if (authOnly) {
    return (
      <AuthOnly>
        {children}
      </AuthOnly>
    );
  }

  return <>{children}</>;
}

Middleware.propTypes = {
  authOnly: PropTypes.bool,
  children: PropTypes.any.isRequired,
};
