import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';

import { OnboardingTabs } from '@lib/constants/onboarding';
import { connectDatabase, createDatabase } from '@lib/api/databases';
import { MAX_SMALL_DATABASE_SIZE } from '@lib/constants/bases';
import { formatBytes } from '@lib/helpers/formatBytes';
import { setAuthUserAsOnboarded } from '@lib/api/auth';

import { BaseConnect } from '@components/bases/BaseConnect';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';
import { useData } from '@lib/hooks/useData';

export function OnboardingConnectDatabase({
  setCurrentTab,
  powerbaseType,
  base,
  setBase,
  isNewBase,
}) {
  const handleCancel = () => {
    setCurrentTab(OnboardingTabs.SETUP_DATABASE);
  };

  const {
    data, status, dispatch, error,
  } = useData();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async ({ isNew, ...payload }) => {
    setModalOpen(false);
    dispatch.pending();

    try {
      const response = isNew
        ? await createDatabase(payload)
        : await connectDatabase(payload);
      let content = '';

      await setAuthUserAsOnboarded();
      setBase(response.database);

      if (!isNew && response.database.isTurbo && response.dbSize) {
        if (response.dbSize > MAX_SMALL_DATABASE_SIZE) {
          const bytes = response.dbSize * 1024;
          content = `It might take hours/days to import the database with the size of ${formatBytes(bytes)}`;
        }
      }

      dispatch.resolved(content);
    } catch (err) {
      dispatch.rejected(err.response.data.exception || err.response.data.error);
    }

    setModalOpen(true);
  };

  const handleAlertSubmit = () => {
    setModalOpen(false);
    if (!error) setCurrentTab(OnboardingTabs.INVITE_GUESTS);
  };

  return (
    <Tabs.Content value={OnboardingTabs.CONNECT_DATABASE}>
      <p className="mt-8 mb-4 text-center text-base text-gray-600">
        Connect to your database
      </p>
      <BaseConnect
        submit={handleSubmit}
        cancel={handleCancel}
        powerbaseType={powerbaseType}
        loading={status === 'pending'}
        isNewBase={isNewBase}
      />
      <ConnectBaseModal
        open={modalOpen}
        setOpen={setModalOpen}
        base={base}
        content={data}
        error={error}
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
