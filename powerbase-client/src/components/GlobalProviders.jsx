import React from 'react';
import { SWRConfig } from 'swr';
import PropTypes from 'prop-types';
import { AuthUserProvider } from '@models/AuthUser';
import { SaveStatusProvider } from '@models/SaveStatus';
import { NotificationsProvider } from '@models/Notifications';
import { SharedBasesProvider } from '@models/SharedBases';

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
          <NotificationsProvider>
            <SharedBasesProvider>
              {children}
            </SharedBasesProvider>
          </NotificationsProvider>
        </SaveStatusProvider>
      </AuthUserProvider>
    </SWRConfig>
  );
}

GlobalProviders.propTypes = {
  children: PropTypes.any.isRequired,
};
