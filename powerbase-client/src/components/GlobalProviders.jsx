import React from 'react';
import { SWRConfig } from 'swr';
import PropTypes from 'prop-types';
import { AuthUserProvider } from '@models/AuthUser';

export function GlobalProviders({ children }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        errorRetryCount: 2,
      }}
    >
      <AuthUserProvider>
        {children}
      </AuthUserProvider>
    </SWRConfig>
  );
}

GlobalProviders.propTypes = {
  children: PropTypes.element.isRequired,
};
