import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';

import { OnboardingTabs } from '@lib/constants/onboarding';
import { connectDatabase } from '@lib/api/databases';
import { MAX_SMALL_DATABASE_SIZE } from '@lib/constants/bases';
import { formatBytes } from '@lib/helpers/formatBytes';

import { BaseConnect } from '@components/bases/BaseConnect';
import { ConnectBaseModal } from '@components/bases/ConnectBaseModal';

export function OnboardingConnectDatabase({ setCurrentTab, powerbaseType }) {
  const [modal, setModal] = useState({
    open: false,
    content: '',
    buttonText: 'Confirm',
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
      const response = await connectDatabase(payload);

      setModal((val) => ({ ...val, base: response.database }));

      if (response.database.isTurbo && response.dbSize) {
        const databaseSize = +response.dbSize.split(' ')[0];

        if (databaseSize > MAX_SMALL_DATABASE_SIZE) {
          setModal((val) => ({
            ...val,
            content: `It might take hours/days to import the database with the size of ${formatBytes(databaseSize)}`,
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
      <BaseConnect
        submit={handleSubmit}
        cancel={handleCancel}
        powerbaseType={powerbaseType}
        loading={loading}
        setLoading={setLoading}
      />
      <ConnectBaseModal
        open={modal.open}
        setOpen={(val) => setModal((prevVal) => ({ ...prevVal, open: val }))}
        base={modal.base}
        content={modal.content}
        error={modal.error}
        buttonText={modal.buttonText}
        submit={handleAlertSubmit}
      />
    </Tabs.Content>
  );
}

OnboardingConnectDatabase.propTypes = {
  powerbaseType: PropTypes.object.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
};
