import React from 'react';
import PropTypes from 'prop-types';
import Gravatar from 'react-gravatar';

import { useBaseGuests } from '@models/BaseGuests';
import { useSaveStatus } from '@models/SaveStatus';
import { removeGuest } from '@lib/api/guests';
import { GuestAccessMenu } from '@components/ui/GuestAccessMenu';

export function GuestCard({ guest, setGuests }) {
  const { data: guests, mutate: mutateGuests } = useBaseGuests();
  const { saving, saved, catchError } = useSaveStatus();

  const handleChangeAccess = (value) => {
    setGuests((prevGuests) => prevGuests.map((item) => ({
      ...item,
      access: item.id === guest.id
        ? value
        : item.access,
    })));
  };

  const removeGuestAccess = async () => {
    saving();

    const updatedGuests = guests.filter((item) => item.id !== guest.id);
    setGuests(updatedGuests);

    try {
      await removeGuest({ id: guest.id });
      await mutateGuests(updatedGuests);
      saved(`Successfully removed guest '${guest.firstName}'`);
    } catch (err) {
      catchError(err.response.data.error || err.response.data.exception);
    }
  };

  return (
    <div className="relative flex items-center space-x-4">
      <div className="flex-shrink-0">
        <Gravatar
          email={guest.email}
          className="h-8 w-8 rounded-full"
          alt={`${guest.firstName}'s profile picture`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {guest.firstName} {guest.lastName}
        </p>
        <p className="text-sm text-gray-500 truncate">{guest.email}</p>
      </div>
      <GuestAccessMenu access={guest.access} change={handleChangeAccess} remove={removeGuestAccess} />
    </div>
  );
}

GuestCard.propTypes = {
  guest: PropTypes.object.isRequired,
  setGuests: PropTypes.func.isRequired,
};
