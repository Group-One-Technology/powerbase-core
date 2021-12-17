import React from 'react';
import PropTypes from 'prop-types';
import * as Tabs from '@radix-ui/react-tabs';
import { OnboardingTabs } from '@lib/constants/onboarding';

export function OnboardingConnectDatabase({
  setCurrentTab,
  databaseType,
  powerbaseType,
  setPowerbaseType,
}) {
  console.log({
    databaseType,
    powerbaseType,
    setPowerbaseType,
  });

  const handlePreviousStep = () => {
    setCurrentTab(OnboardingTabs.SETUP_DATABASE);
  };

  const handleNextStep = () => {
    setCurrentTab(OnboardingTabs.INVITE_GUESTS);
  };

  return (
    <Tabs.Content value={OnboardingTabs.CONNECT_DATABASE}>
      <p className="mt-8 mb-4 text-center text-base text-gray-500">
        Connect to your database
      </p>
      <div className="my-4 flex justify-center space-x-4">
        <button
          type="button"
          className="border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-gray-500 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          onClick={handlePreviousStep}
        >
          Return
        </button>
        <button
          type="button"
          className="border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleNextStep}
        >
          Connect and Save
        </button>
      </div>
    </Tabs.Content>
  );
}

OnboardingConnectDatabase.propTypes = {
  databaseType: PropTypes.object.isRequired,
  powerbaseType: PropTypes.object.isRequired,
  setPowerbaseType: PropTypes.func.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
};
