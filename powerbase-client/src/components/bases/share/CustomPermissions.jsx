import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Switch } from '@headlessui/react';

import { useBaseUser } from '@models/BaseUser';

export function CustomPermissions({
  guest,
  permissions,
  setPermissions,
  loading,
}) {
  const { access: { changeGuestAccess, inviteGuests } } = useBaseUser();
  const canToggleAccess = guest ? changeGuestAccess : inviteGuests;

  const handlePermissionToggle = (selectedItem) => {
    setPermissions(permissions.map((item) => ({
      ...item,
      enabled: item.name === selectedItem.name
        ? !item.enabled
        : item.enabled,
    })));
  };

  return (
    <ul>
      {permissions.map((item) => {
        const itemKey = item.name.split(' ').join('_');

        return (
          <li key={itemKey} className="my-1 flex text-sm text-gray-900">
            <label htmlFor={itemKey}>
              {item.name}
            </label>
            <Switch
              id={itemKey}
              checked={item.enabled}
              onChange={() => handlePermissionToggle(item)}
              className={cn(
                'ml-auto relative inline-flex flex-shrink-0 h-4 w-7 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                item.enabled ? 'bg-indigo-600' : 'bg-gray-200',
                (loading || !canToggleAccess) ? 'cursor-not-allowed' : 'cursor-pointer',
              )}
              disabled={loading || !canToggleAccess}
            >
              <span className="sr-only">Show Field</span>
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                  item.enabled ? 'translate-x-3' : 'translate-x-0',
                )}
              />
            </Switch>
          </li>
        );
      })}
    </ul>
  );
}

CustomPermissions.propTypes = {
  guest: PropTypes.object,
  permissions: PropTypes.array.isRequired,
  setPermissions: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
