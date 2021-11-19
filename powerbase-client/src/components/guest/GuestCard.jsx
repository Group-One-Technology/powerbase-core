import React from 'react';
import PropTypes from 'prop-types';
import Gravatar from 'react-gravatar';
import { useHistory } from 'react-router-dom';

import { useBaseGuests } from '@models/BaseGuests';
import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useViewFields } from '@models/ViewFields';
import { changeGuestAccess, removeGuest } from '@lib/api/guests';
import { GuestAccessMenu } from '@components/ui/GuestAccessMenu';
import { Badge } from '@components/ui/Badge';

export function GuestCard({
  guest,
  setGuests,
  owner,
  menu = true,
}) {
  const history = useHistory();
  const { baseUser, mutate: mutateBaseUser } = useBaseUser();
  const { data: guests, mutate: mutateGuests } = useBaseGuests();
  const { mutate: mutateViewFields } = useViewFields();
  const { saving, saved, catchError } = useSaveStatus();

  const handleChangeAccess = async (value) => {
    if (!owner && baseUser?.can('changeGuestAccess') && setGuests) {
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
        if (guest.userId === baseUser.userId) {
          await mutateBaseUser();
        }
        mutateViewFields();
        await mutateGuests(updatedGuests);
        saved(`Successfully changed guest ${guest.firstName}'s access to '${value}'.`);
      } catch (err) {
        catchError(err.response.data.error || err.response.data.exception);
      }
    }
  };

  const removeGuestAccess = async () => {
    if (!owner && baseUser?.can('removeGuests') && setGuests) {
      try {
        if (baseUser.userId === guest.userId) {
          await removeGuest({ id: guest.id });
          await mutateBaseUser();
          history.push('/');
        } else {
          saving();

          const updatedGuests = guests.filter((item) => item.id !== guest.id);
          setGuests(updatedGuests);

          await removeGuest({ id: guest.id });
          mutateViewFields();
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
          {owner && <Badge color="gray" className="ml-1">Owner</Badge>}
          {(!owner && !guest.isAccepted) && <Badge color="yellow" className="ml-1">Pending</Badge>}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {guest.email} {React.isValidElement(menu) && `(${guest.access})`}
        </p>
      </div>
      {React.isValidElement(menu)
        ? menu
        : (
          <GuestAccessMenu
            guest={guest}
            change={handleChangeAccess}
            remove={removeGuestAccess}
            owner={owner}
            disabled={!menu}
          />
        )}
    </div>
  );
}

GuestCard.propTypes = {
  guest: PropTypes.object.isRequired,
  setGuests: PropTypes.func,
  owner: PropTypes.bool,
  menu: PropTypes.any,
};
