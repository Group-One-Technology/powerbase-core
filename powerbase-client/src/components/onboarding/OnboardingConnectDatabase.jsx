import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';
import { Chunk } from 'editmode-react';

import { OnboardingTabs } from '@lib/constants/onboarding';
import { connectDatabase, createDatabase } from '@lib/api/databases';
import { MAX_SMALL_DATABASE_SIZE } from '@lib/constants/bases';
import { formatBytes } from '@lib/helpers/formatBytes';
import { setAuthUserAsOnboarded } from '@lib/api/auth';

import { BaseConnect } from '@components/bases/BaseConnect';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';

export function OnboardingConnectDatabase({
  setCurrentTab,
  powerbaseType,
  base,
  setBase,
  isNewBase,
}) {
  const [modal, setModal] = useState({
    open: false,
    content: '',
    error: undefined,
  });

  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setCurrentTab(OnboardingTabs.SETUP_DATABASE);
  };

  const handleSubmit = async (payload) => {
    setLoading(true);
    setModal({ open: false });

    try {
      const response = isNewBase
        ? await createDatabase(payload)
        : await connectDatabase(payload);

      await setAuthUserAsOnboarded();
      setBase(response.database);

      if (!isNewBase && response.database.isTurbo && response.dbSize) {
        if (response.dbSize > MAX_SMALL_DATABASE_SIZE) {
          const bytes = response.dbSize * 1024;
          setModal((val) => ({
            ...val,
            content: `It might take hours/days to import the database with the size of ${formatBytes(bytes)}`,
          }));
        }
      }
    } catch (err) {
      setModal((val) => ({
        ...val,
        error: err.response.data.exception || err.response.data.error,
      }));
    }

    setModal((prevVal) => ({ ...prevVal, open: true }));
    setLoading(false);
  };

  const handleAlertSubmit = () => {
    setModal((prevVal) => ({ ...prevVal, open: false }));

    if (!modal.error) {
      setCurrentTab(OnboardingTabs.INVITE_GUESTS);
    }
  };

  return (
    <Tabs.Content value={OnboardingTabs.CONNECT_DATABASE}>
      <p className="mt-8 mb-4 text-center text-base text-gray-600">
        <Chunk identifier="onboarding_connect_database_description">
          Connect to your database
        </Chunk>
      </p>
      <BaseConnect
        submit={handleSubmit}
        cancel={handleCancel}
        powerbaseType={powerbaseType}
        loading={loading}
        setLoading={setLoading}
        isNewBase={isNewBase}
      />
      <ConnectBaseModal
        open={modal.open}
        setOpen={(val) => setModal((prevVal) => ({ ...prevVal, open: val }))}
        base={base}
        content={modal.content}
        error={modal.error}
        buttonText="Confirm"
        submit={handleAlertSubmit}
      />
    </Tabs.Content>
  );
}

OnboardingConnectDatabase.propTypes = {
  powerbaseType: PropTypes.object.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
  base: PropTypes.object,
  setBase: PropTypes.func.isRequired,
  isNewBase: PropTypes.bool,
};
