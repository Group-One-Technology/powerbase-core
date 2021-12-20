import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

import { OnboardingTabs } from '@lib/constants/onboarding';
import { setAuthUserAsOnboarded } from '@lib/api/auth';
import { useAuthUser } from '@models/AuthUser';
import { Button } from '@components/ui/Button';

export function OnboardingInviteGuests({ base }) {
  const { authUser, mutate: mutateAuthUser } = useAuthUser();
  const history = useHistory();
  const [skipLoading, setSkipLoading] = useState(false);

  if (!base) return null;

  const handleSkip = async () => {
    setSkipLoading(true);
    await setAuthUserAsOnboarded();
    mutateAuthUser({ ...authUser, isOnboarded: true });
    history.push(`/base/${base.id}/progress`);
  };

  return (
    <Tabs.Content value={OnboardingTabs.INVITE_GUESTS}>
      <p className="mt-8 mb-4 text-center text-base text-gray-500">
        invite and collaborate with others. You can either invite them as:
      </p>
      <div className="my-4 flex justify-center space-x-4">
        <Button
          type="button"
          className="border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={skipLoading}
        >
          Invite
        </Button>
        <Button
          type="button"
          className="border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-gray-500 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          onClick={handleSkip}
          loading={skipLoading}
        >
          Skip this step
        </Button>
      </div>
    </Tabs.Content>
  );
}

OnboardingInviteGuests.propTypes = {
  base: PropTypes.object,
};
