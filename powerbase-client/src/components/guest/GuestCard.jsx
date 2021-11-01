import React from 'react';
import PropTypes from 'prop-types';
import Gravatar from 'react-gravatar';
import { GuestAccessMenu } from '@components/ui/GuestAccessMenu';

export function GuestCard({ guest, setGuests }) {
  const handleChangeAccess = (value) => {
    setGuests((prevGuests) => prevGuests.map((item) => ({
      ...item,
      access: item.id === guest.id
        ? value
        : item.access,
    })));
  };

  const removeGuest = () => {
    setGuests((prevGuests) => prevGuests.filter((item) => item.id !== guest.id));
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
      <GuestAccessMenu access={guest.access} change={handleChangeAccess} remove={removeGuest} />
    </div>
  );
}

GuestCard.propTypes = {
  guest: PropTypes.object.isRequired,
  setGuests: PropTypes.func.isRequired,
};
