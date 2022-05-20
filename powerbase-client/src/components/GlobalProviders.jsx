import React from 'react';
import { SWRConfig } from 'swr';
import PropTypes from 'prop-types';
import { Editmode } from 'editmode-react';

import { AuthUserProvider } from '@models/AuthUser';
import { SaveStatusProvider } from '@models/SaveStatus';
import { NotificationsProvider } from '@models/Notifications';
import { SharedBasesProvider } from '@models/SharedBases';
import { FieldTypesProvider } from '@models/FieldTypes';
import { GeneralSettingsProvider } from '@models/GeneralSettings';

const { EDITMODE_PROJECT_ID } = process.env;

export function GlobalProviders({ children }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        errorRetryCount: 2,
      }}
    >
      <Editmode projectId={EDITMODE_PROJECT_ID}>
        <AuthUserProvider>
          <GeneralSettingsProvider>
            <SaveStatusProvider>
              <FieldTypesProvider>
                <NotificationsProvider>
                  <SharedBasesProvider>
                    {children}
                  </SharedBasesProvider>
                </NotificationsProvider>
              </FieldTypesProvider>
            </SaveStatusProvider>
          </GeneralSettingsProvider>
        </AuthUserProvider>
      </Editmode>
    </SWRConfig>
  );
}

GlobalProviders.propTypes = {
  children: PropTypes.any.isRequired,
};
