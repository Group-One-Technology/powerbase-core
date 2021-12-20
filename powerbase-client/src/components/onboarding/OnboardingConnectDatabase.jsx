import React from 'react';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';
import { OnboardingTabs } from '@lib/constants/onboarding';
import { BaseConnect } from '@components/bases/BaseConnect';

export function OnboardingConnectDatabase({ setCurrentTab, powerbaseType }) {
  const handleCancel = () => {
    setCurrentTab(OnboardingTabs.SETUP_DATABASE);
  };

  const handleSubmit = (values) => {
    console.log(values);
    // setCurrentTab(OnboardingTabs.INVITE_GUESTS);
  };

  return (
    <Tabs.Content value={OnboardingTabs.CONNECT_DATABASE}>
      <BaseConnect
        submit={handleSubmit}
        cancel={handleCancel}
        powerbaseType={powerbaseType}
      />
    </Tabs.Content>
  );
}

OnboardingConnectDatabase.propTypes = {
  powerbaseType: PropTypes.object.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
};
