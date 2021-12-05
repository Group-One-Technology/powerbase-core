import React from 'react';
import Gravatar from 'react-gravatar';
import PropTypes from 'prop-types';
import { useBaseGuests } from '@models/BaseGuests';

export function GuestRoleCard({ role, menu }) {
  const { data: guests } = useBaseGuests();
  const roleGuests = guests?.filter((item) => item.access === role);

  if (!guests) {
    return null;
  }

  return (
    <div className="relative flex items-center space-x-4">
      <div className="flex-shrink-0">
        <Gravatar
          email={`${role}@nonexistent.user`}
          className="h-8 w-8 rounded-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate capitalize">
          {role}s
        </p>
        <p className="text-sm text-gray-500 truncate">
          {`${roleGuests.length} user(s) have this role.`}
        </p>
      </div>
      {menu}
    </div>
  );
}

GuestRoleCard.propTypes = {
  role: PropTypes.string.isRequired,
  menu: PropTypes.any,
};
