import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { PlusIcon } from '@heroicons/react/outline';

import { OnboardingTabs } from '@lib/constants/onboarding';
import { ACCESS_LEVEL } from '@lib/constants/permissions';
import { setAuthUserAsOnboarded } from '@lib/api/auth';
import { useAuthUser } from '@models/AuthUser';
import { Button } from '@components/ui/Button';
import { GuestInviteInput } from '@components/guest/GuestInviteInput';

export function OnboardingInviteGuests({ base }) {
  const { authUser, mutate: mutateAuthUser } = useAuthUser();
  const history = useHistory();
  const [skipLoading, setSkipLoading] = useState(false);

  const [invitedUsers, setInvitedUsers] = useState([{
    id: 1,
    email: '',
    access: ACCESS_LEVEL[3],
  }]);

  if (!base) return null;

  const handleEmailChange = (id, value) => {
    setInvitedUsers((items) => items.map((item) => ({
      ...item,
      email: id === item.id
        ? value
        : item.email,
    })));
  };

  const handleAccessChange = (id, value) => {
    setInvitedUsers((items) => items.map((item) => ({
      ...item,
      access: id === item.id
        ? value
        : item.access,
    })));
  };

  const handleAddGuest = () => {
    setInvitedUsers((items) => [
      ...items,
      {
        id: invitedUsers.length + 1,
        email: '',
        access: ACCESS_LEVEL[3],
      },
    ]);
  };

  const handleRemoveGuest = (id) => {
    const updatedInvitedUsers = invitedUsers
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        id: index + 1,
      }));

    setInvitedUsers(updatedInvitedUsers);
  };

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

      <div className="max-w-lg mx-auto flex flex-col gap-y-4">
        {invitedUsers.map((guest) => (
          <GuestInviteInput
            key={guest.id}
            email={guest.email}
            onEmailChange={(value) => handleEmailChange(guest.id, value)}
            access={guest.access}
            setAccess={(value) => handleAccessChange(guest.id, value)}
            baseUserAccess={ACCESS_LEVEL[0]}
            remove={() => handleRemoveGuest(guest.id)}
            className="mx-4"
          />
        ))}
        <div className="mx-4">
          <button
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-200 focus:bg-gray-200"
            onClick={handleAddGuest}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add guest
          </button>
        </div>
      </div>

      <div className="my-4 flex justify-center space-x-4">
        <Button
          type="button"
          className="inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={skipLoading}
        >
          Invite
        </Button>
        <Button
          type="button"
          className="inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-gray-500 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
