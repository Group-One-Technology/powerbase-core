import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import { Switch } from '@headlessui/react';
import { useBaseUser } from '@models/BaseUser';
import { CogIcon } from '@heroicons/react/outline';

export function CustomPermissions({ permissions, setPermissions, loading }) {
  const { access: { inviteGuests } } = useBaseUser();

  const handlePermissionToggle = (selectedItem) => {
    setPermissions((prevVal) => prevVal.map((item) => ({
      ...item,
      enabled: item.name === selectedItem.name
        ? !item.enabled
        : item.enabled,
    })));
  };

  return (
    <ul className="px-6 py-4 border-b border-gray-200">
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
                (loading || !inviteGuests) ? 'cursor-not-allowed' : 'cursor-pointer',
              )}
              disabled={loading || !inviteGuests}
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
      <li className="text-sm text-gray-900">
        <button
          type="button"
          className="ml-auto p-1 px-2 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 focus:bg-gray-200"
        >
          <CogIcon className="h-4 w-4 mr-1" />
          Configure More Permissions
        </button>
      </li>
    </ul>
  );
}

CustomPermissions.propTypes = {
  permissions: PropTypes.array.isRequired,
  setPermissions: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
