import React from 'react';
import PropTypes from 'prop-types';
import Gravatar from 'react-gravatar';
import { useHistory } from 'react-router-dom';

import { useBaseGuests } from '@models/BaseGuests';
import { useBaseUser } from '@models/bases/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { changeGuestAccess, removeGuest } from '@lib/api/guests';
import { GuestAccessMenu } from '@components/ui/GuestAccessMenu';
import { Badge } from '@components/ui/Badge';

export function GuestCard({ guest, setGuests, owner }) {
  const history = useHistory();
  const { baseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();
  const { saving, saved, catchError } = useSaveStatus();

  const handleChangeAccess = async (value) => {
    if (!owner) {
      saving();

      const updatedGuests = guests.map((item) => ({
        ...item,
        access: item.id === guest.id
          ? value
          : item.access,
      }));
      setGuests(updatedGuests);

      try {
        await changeGuestAccess({ id: guest.id, access: value });
        await mutateGuests(updatedGuests);
        saved(`Successfully changed guest ${guest.firstName}'s access to '${value}'.`);
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  const removeGuestAccess = async () => {
    if (!owner) {
      try {
        if (baseUser.userId === guest.userId) {
          await removeGuest({ id: guest.id });
          history.push('/');
        } else {
          saving();

          const updatedGuests = guests.filter((item) => item.id !== guest.id);
          setGuests(updatedGuests);

          await removeGuest({ id: guest.id });
          await mutateGuests(updatedGuests);
          saved(`Successfully removed guest '${guest.firstName}'`);
        }
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }
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
          {(!owner && !guest.isAccepted) && <Badge color="yellow" className="ml-1">Pending</Badge>}
        </p>
        <p className="text-sm text-gray-500 truncate">{guest.email}</p>
      </div>
      <GuestAccessMenu
        guest={guest}
        change={handleChangeAccess}
        remove={removeGuestAccess}
        owner={owner}
      />
    </div>
  );
}

GuestCard.propTypes = {
  guest: PropTypes.object.isRequired,
  setGuests: PropTypes.func.isRequired,
  owner: PropTypes.bool,
};
