import React from 'react';
import { SWRConfig } from 'swr';
import PropTypes from 'prop-types';
import { AuthUserProvider } from '@models/AuthUser';
import { SaveStatusProvider } from '@models/SaveStatus';

export function GlobalProviders({ children }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        errorRetryCount: 2,
      }}
    >
      <AuthUserProvider>
        <SaveStatusProvider>
          {children}
        </SaveStatusProvider>
      </AuthUserProvider>
    </SWRConfig>
  );
}

GlobalProviders.propTypes = {
  children: PropTypes.element.isRequired,
};
