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
import { useSaveStatus } from '@models/SaveStatus';
import { inviteMultipleGuests } from '@lib/api/guests';

export function OnboardingInviteGuests({ base }) {
  const history = useHistory();
  const { authUser, mutate: mutateAuthUser } = useAuthUser();
  const {
    saved, saving, loading, catchError,
  } = useSaveStatus();

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

  const handleInviteGuests = async (evt) => {
    evt.preventDefault();
    if (!base) return;

    const users = invitedUsers
      .filter((item) => item.email.length > 0)
      .map((item) => ({
        ...item,
        access: item.access.name,
      }));

    if (users.length) {
      saving();

      try {
        await inviteMultipleGuests({ databaseId: base.id, users });
        await setAuthUserAsOnboarded();
        mutateAuthUser({ ...authUser, isOnboarded: true });
        history.push(`/base/${base.id}/progress`);
        saved(`Successfully invited ${users.length} user(s) to "${base.name}" base.`);
      } catch (err) {
        catchError(err.response.data.exception || err.response.data.error);
      }
    } else {
      catchError('You must have at least one user to invite.');
    }
  };

  return (
    <Tabs.Content value={OnboardingTabs.INVITE_GUESTS}>
      <p className="mt-8 mb-4 text-center text-base text-gray-500">
        invite and collaborate with others. You can either invite them as:
      </p>

      <form onSubmit={handleInviteGuests}>
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
            type="submit"
            className="inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            loading={loading}
            disabled={skipLoading}
          >
            Invite
          </Button>
          <Button
            type="button"
            className="inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-gray-500 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={handleSkip}
            loading={skipLoading}
            disabled={loading}
          >
            Skip this step
          </Button>
        </div>
      </form>
    </Tabs.Content>
  );
}

OnboardingInviteGuests.propTypes = {
  base: PropTypes.object,
};
